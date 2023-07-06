import { useTheme } from "@emotion/react";
import { Modals, OnCloseContext, useStore } from "@obi-wallet/common";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { CustomTheme } from "@obi-wallet/theme";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { Container } from "./container";
import { StateRenderer } from "./state-renderer";

import "./vuplex-polyfill.js";

// eslint-disable-next-line mobx/missing-observer
export function Modal({ theme }: { theme: CustomTheme }) {
  return (
    <Container theme={theme}>
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

      if (data.type !== "@obi/sign-and-broadcast-transaction") return;
      if (!store.walletsStore.currentWallet) return;

      const response = await SignAndBroadcastTransactionUserInteraction.start({
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
          "*"
        );
      } else {
        postMessage(message);
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
