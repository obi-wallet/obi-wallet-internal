import { useTheme } from "@emotion/react";
import { Modals, OnCloseContext, useStore } from "@obi-wallet/common";
import { Config } from "@obi-wallet/config";
import {
  KeyType,
  ObservableMultisigWallet,
  SignAndBroadcastTransactionUserInteraction,
  createGatekeeperConfig,
} from "@obi-wallet/sdk";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { Container } from "./container";
import { StateRenderer } from "./state-renderer";

import "./vuplex-polyfill.js";

// eslint-disable-next-line mobx/missing-observer
export function Modal({ config }: { config: Config }) {
  return (
    <Container config={config}>
      <ModalWithoutProvider />
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
  const theme = useTheme();
  // Enable auto-broadcast for ethereum demo
  const autoBroadcast = theme.ethereumBalances;

  useEffect(() => {
    return autorun(() => {
      const address = theme.ethereumBalances
        ? store.sdkRootStore.ethereumDemoStore.ethereumAccount?.address
        : store.walletsStore.address;
      // Expose current wallet address (or null) to the parent window
      postMessage({
        type: "@obi/current-wallet",
        address: address ?? null,
      });
    });
  }, [theme, store]);

  useEffect(() => {
    async function listener(event: MessageEvent) {
      let data = event.data;
      if (typeof data === "string") {
        data = JSON.parse(data);
      }
      console.log("Received message", data);

      switch (data.type) {
        case "@obi/sign-and-broadcast-transaction": {
          if (!store.walletsStore.currentWallet) return;

          const response =
            await SignAndBroadcastTransactionUserInteraction.start({
              messages: data.payload,
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
          } else {
            postMessage(message);
          }
          break;
        }

        case "@obi/create-account": {
          const response = await fetch("/api/zauth/create-account", {
            method: "POST",
            body: JSON.stringify({
              chainId: store.chainStore.currentChain,
              accessToken: data.payload.accessToken,
              refreshToken: data.payload.refreshToken,
            }),
          });

          const { publicKey, proxyAddress, ethereumAccount, newUser } =
            await response.json();

          const wallet = ObservableMultisigWallet.create({
            type: "multisig",
            data: {
              chain: store.chainStore.currentChain,
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
          } else {
            postMessage(message);
          }
          break;
        }
      }
    }

    return addEventListener(listener);
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
