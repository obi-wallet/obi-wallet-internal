import { Env, Modals, OnCloseContext, useStore } from "@obi-wallet/common";
import { Config } from "@obi-wallet/config";
import {
  KeyType,
  ObservableMultisigWallet,
  Secp256k1PrivateKeySigner,
  SignAndBroadcastTransactionUserInteraction,
  ZAuthKeySigner,
  createGatekeeperConfig,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import * as elliptic from "elliptic";
import { ethers } from "ethers";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import invariant from "tiny-invariant";

import { Container } from "./container";
import { Provider } from "./provider";
import { StateRenderer } from "./state-renderer";

import "./vuplex-polyfill.js";

export interface EthereumAccount {
  publicKey: Secp256k1PublicKey;
  evmSignerAddress: string;
  evmUserContractAddress: string;
}

// eslint-disable-next-line mobx/missing-observer
export function Modal({ config, env }: { config: Config; env: Env }) {
  if (config.headless)
    return (
      <Provider config={config} env={env}>
        <Modals />
        <MessageHandlers />
      </Provider>
    );

  return (
    <Container theme={config.theme}>
      <Provider config={config} env={env}>
        <ModalWithoutProvider />
      </Provider>
    </Container>
  );
}

export const ModalWithoutProvider = observer(function ModalWithoutProvider() {
  return (
    <OnCloseContext.Provider value={onClose}>
      <StateRenderer />
      <Modals />
      <MessageHandlers />
    </OnCloseContext.Provider>
  );
});

const MessageHandlers = observer(function MessageHandlers() {
  const store = useStore();
  // TODO: More robut auto-broadcast handling
  const autoBroadcast = false;

  useEffect(() => {
    return autorun(() => {
      const address = store.configStore.config.ethereumBalances
        ? store.sdkRootStore.ethereumDemoStore.ethereumAccount?.address
        : store.walletsStore.address;
      // Expose current wallet address (or null) to the parent window
      postMessage({
        type: "@obi/current-wallet",
        address: address ?? null,
      });
    });
  }, [store]);

  useEffect(() => {
    async function listener(event: MessageEvent) {
      let data = event.data;
      if (typeof data === "string" && data.startsWith("setImmediate")) {
        console.log("Ignoring setImmediate message");
      } else if (typeof data === "string") {
        data = JSON.parse(data);
        console.log("Received message", data);
      }

      switch (data.type) {
        case "@obi/sign-message": {
          if (!store.walletsStore.currentWallet) return;

          const zAuthKey =
            store.walletsStore.currentWallet.owner.getUsableKeyOfType(
              KeyType.ZAuth,
            );
          const deviceKey =
            store.walletsStore.currentWallet.owner.getUsableKeyOfType(
              KeyType.Device,
            );
          invariant(zAuthKey || deviceKey, "Wallet has no ZAuth or device key");
          let signer;
          if (zAuthKey) {
            signer = new ZAuthKeySigner(zAuthKey);
          } else if (deviceKey?.payload.privateKey) {
            signer = new Secp256k1PrivateKeySigner(
              deviceKey.payload.privateKey,
            );
          } else {
            throw new Error("Wallet has no ZAuth or device key");
          }

          const hash = ethers.hashMessage(data.payload);
          const response = `0x${Buffer.from(
            await signer.signHash(
              new Uint8Array(Buffer.from(hash.slice(2), "hex")),
            ),
          ).toString("hex")}`;
          const message = {
            type: "@obi/sign-message-response",
            payload: response,
          };
          if (event.source) {
            event.source?.postMessage(
              message,
              // @ts-expect-error this is fine
              "*",
            );
            console.log(JSON.stringify(message));
          } else {
            postMessage(message);
            console.log(JSON.stringify(message));
          }

          break;
        }

        case "@obi/sign-and-broadcast-transaction": {
          if (!store.walletsStore.currentWallet) {
            console.log("no current wallet");
            return;
          } else {
            console.log("current wallet retrieved");
            console.log("payload", data.payload);
          }

          const payload = Array.isArray(data.payload)
            ? {
                messages: data.payload,
              }
            : data.payload;
          const response =
            await SignAndBroadcastTransactionUserInteraction.start({
              messages: payload.messages,
              targetChainId: payload.targetChainId,
              cancelable: true,
              walletMeta: store.walletsStore.currentWallet.meta,
              demoMode: store.walletsStore.currentWallet.isDemo,
              autoBroadcast,
            });

          const message = {
            type: "@obi/sign-and-broadcast-transaction-response",
            payload: response,
          };
          if (event.source) {
            event.source?.postMessage(
              message,
              // @ts-expect-error this is fine
              "*",
            );
            console.log(JSON.stringify(message));
          } else {
            postMessage(message);
            console.log(JSON.stringify(message));
          }
          break;
        }
        case "@obi/get-zauth-tokens": {
          const tokens = store.zauthStore.currentTokens;
          // error for expediency in unity
          console.log("Get tokens: ", tokens);
          const message = {
            type: "@obi/get-tokens-response",
            tokens: tokens,
          };
          postMessage(message);
          break;
        }
        case "@obi/set-zauth-tokens": {
          store.zauthStore.setCurrentTokens(data.payload);
          break;
        }
        case "@obi/get-signing-address": {
          const base64PubKey =
            store.walletsStore.currentWallet?.owner.getKeyOfType(KeyType.Device)
              ?.publicKey.value;
          // TODO: prompt for webauthn if no device pubkey
          invariant(base64PubKey, "no device pubkey");
          const pubKeyBuffer = Buffer.from(base64PubKey, "base64");
          // Remove prefix byte (0x04) for uncompressed public keys
          let keyBytes: Buffer;
          if (pubKeyBuffer.length === 65 && pubKeyBuffer[0] === 0x04) {
            keyBytes = pubKeyBuffer.slice(1);
          } else {
            keyBytes = pubKeyBuffer;
          }
          const pubKeyHex = keyBytes.toString("hex");
          // Decompress the public key
          const ec = new elliptic.ec("secp256k1");
          const keyPair = ec.keyFromPublic(pubKeyHex, "hex");
          const decompressedPubKey = keyPair.getPublic(false, "hex");

          const message = {
            type: "@obi/signing-address-response",
            payload: ethers.computeAddress("0x" + decompressedPubKey),
          };
          postMessage(message);
          console.log(JSON.stringify(message));
          break;
        }
        case "@obi/create-account": {
          console.log("Handling create-account message");
          const homeChainId =
            data.payload.homeChainId ?? store.chainStore.currentChain;
          const response = await fetch("/api/zauth/create-account", {
            method: "POST",
            body: JSON.stringify({
              homeChainId,
              accessToken: data.payload.accessToken,
              refreshToken: data.payload.refreshToken,
            }),
          });

          if (response.status !== 200) {
            const message = {
              type: "@obi/create-account-response",
              payload: {
                error: "invalid token",
              },
            };
            if (event.source) {
              event.source?.postMessage(
                message,
                // @ts-expect-error this is fine
                "*",
              );
              console.log(JSON.stringify(message));
            } else {
              postMessage(message);
              console.log(JSON.stringify(message));
            }
            return;
          }

          const { publicKey, proxyAddress, ethereumAccount, newUser } =
            await response.json();
          const evmAccount: EthereumAccount = ethereumAccount;

          const wallet = ObservableMultisigWallet.create({
            type: "multisig",
            data: {
              chain: homeChainId,
              owner: {
                keys: [
                  {
                    type: KeyType.ZAuth,
                    payload: {
                      publicKey,
                    },
                  },
                ],
                threshold: 1,
              },
              proxyAddress: {
                v: 1,
                address: proxyAddress,
              },
              gatekeeperConfig: createGatekeeperConfig().toJSON(),
              singlesigWallets: [],
              currentAccount: null,
            },
          });

          store.sdkRootStore.ethereumDemoStore.setEthereumAccount(
            proxyAddress,
            ethereumAccount,
          );
          wallet.setEvmSigningAddress(evmAccount.publicKey.value);
          wallet.setEvmUserContractAddress(evmAccount.evmUserContractAddress);
          store.walletsStore.upsertWallet(wallet);

          const message = {
            type: "@obi/create-account-response",
            payload: {
              address: ethereumAccount.address,
              newUser,
            },
          };
          if (event.source) {
            event.source?.postMessage(
              message,
              // @ts-expect-error this is fine
              "*",
            );
            console.log(JSON.stringify(message));
          } else {
            postMessage(message);
            console.log(JSON.stringify(message));
          }
          break;
        }
      }
    }

    const cleanup = addEventListener(listener);
    postMessage({ type: "@obi/ready" });
    return cleanup;
  }, [store, autoBroadcast]);

  return null;
});

function onClose() {
  postMessage({ type: "@obi/close" });
}

function postMessage(message: unknown) {
  window.parent?.postMessage(message, "*");
  // @ts-expect-error: set by ./vuplex-polyfill.js
  window.vuplex?.postMessage(message);
}

function addEventListener(listener: (event: MessageEvent) => void) {
  window.addEventListener("message", listener, false);
  // @ts-expect-error: set by ./vuplex-polyfill.js
  window.vuplex?.addEventListener("message", listener);
  return () => {
    window.removeEventListener("message", listener);
    // @ts-expect-error: set by ./vuplex-polyfill.js
    window.vuplex?.removeEventListener("message", listener);
  };
}
