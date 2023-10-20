import {
  Env,
  Modals,
  OnCloseContext,
  signAndBroadcastUserOp,
  useStore,
} from "@obi-wallet/common";
import { Config } from "@obi-wallet/config";
import {
  SignAndBroadcastTransactionUserInteraction,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
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
  signingPublicKey: Secp256k1PublicKey;
  evmSigningAddress: string;
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
              multisigKey: store.walletsStore.currentWallet.owner,
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
          let response;
          if (!store.walletsStore.currentWallet) {
            console.log("no current wallet");
            return;
          } else {
            response = await signAndBroadcastUserOp(store.walletsStore, data);
          }
          console.log("full modal response: " + JSON.stringify(response));
          const message = {
            type: "@obi/sign-and-broadcast-transaction-response",
            payload: response.userOpHash,
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
          store.unityStore.deviceId = data.payload;
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
        // case "@obi/create-account": {
        //   // currently unused/broken - use button in modal
        //   console.log("Handling create-account message");
        //   const homeChainId =
        //     data.payload.homeChainId ?? store.chainStore.currentChain;
        //   const response = await fetch("/api/zauth/create-account", {
        //     method: "POST",
        //     body: JSON.stringify({
        //       homeChainId,
        //       accessToken: data.payload.accessToken,
        //       refreshToken: data.payload.refreshToken,
        //     }),
        //   });

        //   if (response.status !== 200) {
        //     const message = {
        //       type: "@obi/create-account-response",
        //       payload: {
        //         error: "invalid token",
        //       },
        //     };
        //     if (event.source) {
        //       event.source?.postMessage(
        //         message,
        //         // @ts-expect-error this is fine
        //         "*",
        //       );
        //       console.log(JSON.stringify(message));
        //     } else {
        //       postMessage(message);
        //       console.log(JSON.stringify(message));
        //     }
        //     return;
        //   }

        //   const { publicKey, proxyAddress, ethereumAccount, newUser } =
        //     await response.json();
        //   console.log("ethereumAccount in modal.tsx is: " + ethereumAccount);
        //   let evmUserContractAddress: string;
        //   try {
        //     evmUserContractAddress = ethereumAccount.address;
        //     if (!evmUserContractAddress) {
        //       evmUserContractAddress = ethereumAccount.targetChain.evmAddress;
        //     }
        //   } catch (e) {
        //     evmUserContractAddress = ethereumAccount.targetChain.evmAddress;
        //   }
        //   console.log(
        //     "evm account is: " + JSON.stringify(evmUserContractAddress),
        //   );

        //   const wallet = ObservableMultisigWallet.create({
        //     type: "multisig",
        //     data: {
        //       chain: homeChainId,
        //       owner: {
        //         keys: [
        //           {
        //             type: KeyType.ZAuth,
        //             payload: {
        //               publicKey,
        //               privateKey: "",
        //             },
        //           },
        //         ],
        //         threshold: 1,
        //         evmSigningAddress: "",
        //         evmUserContractAddress,
        //       },
        //       proxyAddress: {
        //         v: 1,
        //         address: proxyAddress,
        //       },
        //       gatekeeperConfig: createGatekeeperConfig().toJSON(),
        //       singlesigWallets: [],
        //       currentAccount: null,
        //     },
        //   });

        //   store.sdkRootStore.ethereumDemoStore.setEthereumAccount(
        //     proxyAddress,
        //     ethereumAccount,
        //   );

        //   store.walletsStore.upsertWallet(wallet);

        // const message = {
        //   type: "@obi/create-account-response",
        //   payload: {
        //     address: ethereumAccount.address,
        //     newUser,
        //   },
        // };
        // if (event.source) {
        //   event.source?.postMessage(
        //     message,
        //     // @ts-expect-error this is fine
        //     "*",
        //   );
        //   console.log(JSON.stringify(message));
        // } else {
        //   postMessage(message);
        //   console.log(JSON.stringify(message));
        // }
        // break;
        // }
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
