import {
  Env,
  EthTransaction,
  Modals,
  OnCloseContext,
  useStore,
} from "@obi-wallet/common";
import { Config } from "@obi-wallet/config";
import {
  KeyType,
  ObservableMultisigWallet,
  SignAndBroadcastTransactionUserInteraction,
  createGatekeeperConfig,
  Secp256k1PublicKey,
  ExtendedWallet,
} from "@obi-wallet/sdk";
import { ethers } from "ethers";
import * as ethers5 from "ethers5";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import invariant from "tiny-invariant";
import {
  Client,
  IUserOperation,
  Presets,
  UserOperationMiddlewareCtx,
} from "userop";

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
  // TODO: More robust auto-broadcast handling
  const autoBroadcast = false;

  useEffect(() => {
    return autorun(async () => {
      const address = store.configStore.config.ethereumBalances
        ? store.walletsStore.currentWallet?.evmUserContractAddress
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

          const signatureResponse =
            await SignAndBroadcastTransactionUserInteraction.start({
              messages: [
                {
                  raw: data.ethereumPrepend
                    ? ethers.hashMessage(data.payload)
                    : data.payload,
                },
              ],
              demoMode: store.walletsStore.currentWallet.isDemo,
              cancelable: true,
              walletMeta: store.walletsStore.currentWallet.meta,
            });

          /* const response = `0x${Buffer.from(
            await signer.signHash(
              new Uint8Array(Buffer.from(hash.slice(2), "hex")),
            ),
          ).toString("hex")}`; */
          const message = {
            type: "@obi/sign-message-response",
            payload: signatureResponse,
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
            console.log(
              "current wallet retrieved: " +
                JSON.stringify(store.walletsStore.currentWallet),
            );
            console.log(
              "wallet signing address is: " +
                store.walletsStore.currentWallet.evmSigningAddress,
            );
            console.log("payload", data.payload);
          }

          // we need to make the user operation - which might ask for a signature
          // tbd on handling this
          console.log("setting up paymaster middleware...");
          const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
            "https://api.stackup.sh/v1/paymaster/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
            { type: "payg" },
          );
          console.log("setting up client...");
          const client = await Client.init(
            "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
          );
          invariant(
            store.walletsStore.currentWallet.evmSigningAddress,
            "no signing address provided",
          );
          // This likely won't actually be used for network calls
          console.log("setting up dummy provider...");
          const dummyProvider = new ethers5.providers.JsonRpcProvider(
            "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
          );
          console.log("setting up extendedSigner...");
          const extendedSigner = new ExtendedWallet(
            store.walletsStore.currentWallet.evmSigningAddress,
            dummyProvider,
            store.walletsStore.currentWallet.owner,
            store.walletsStore.currentWallet.proxyAddress,
          );
          console.log("building simpleAccount...");
          const simpleAccount = await Presets.Builder.SimpleAccount.init(
            extendedSigner,
            "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
            { paymasterMiddleware },
          );

          invariant(data.payload[0].eth, "no user op inputted");
          console.log("in buildUserOperation()");
          const ethTx = new EthTransaction(data.payload.eth!);
          const userOp: IUserOperation = await client.buildUserOperation(
            simpleAccount.execute(
              ethTx.contractAddress,
              0,
              ethTx.getEncodedCallData(),
            ),
          );
          // signer contract should automatically prepend here
          const ctx: UserOperationMiddlewareCtx =
            new UserOperationMiddlewareCtx(
              userOp,
              "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
              421613,
            );
          console.log("user op hash is: " + ctx.getUserOpHash());

          const interactionObj = {
            messages: [{ raw: ctx.getUserOpHash() }],
            targetChainId: data.payload.targetChainId,
            cancelable: true,
            walletMeta: store.walletsStore.currentWallet.meta,
            demoMode: store.walletsStore.currentWallet.isDemo,
            autoBroadcast: false,
          };
          console.log(
            "interaction object is: " + JSON.stringify(interactionObj),
          );

          const response =
            await SignAndBroadcastTransactionUserInteraction.start({
              ...interactionObj,
              multisigKey: store.walletsStore.currentWallet.owner,
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
        case "@obi/set-device-id": {
          store.unityStore.setDeviceId(data.payload);
          break;
        }
        case "@obi/get-signing-address": {
          const evmAddress =
            store.walletsStore.currentWallet?.evmSigningAddress;
          invariant(evmAddress, "no evm signing address");
          const message = {
            type: "@obi/signing-address-response",
            payload: evmAddress,
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
          console.log("ethereumAccount in modal.tsx is: " + ethereumAccount);
          let evmUserContractAddress: string;
          try {
            evmUserContractAddress = ethereumAccount.address;
            if (!evmUserContractAddress) {
              evmUserContractAddress = ethereumAccount.targetChain.evmAddress;
            }
          } catch (e) {
            evmUserContractAddress = ethereumAccount.targetChain.evmAddress;
          }
          console.log(
            "evm account is: " + JSON.stringify(evmUserContractAddress),
          );

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
                      privateKey: "",
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
