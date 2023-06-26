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
      if (event.data.type !== "@obi/sign-and-broadcast-transaction") return;
      if (!store.walletsStore.currentWallet) return;

      const response = await SignAndBroadcastTransactionUserInteraction.start({
        messages: event.data.payload,
        cancelable: true,
        walletMeta: store.walletsStore.currentWallet.meta,
        demoMode: store.walletsStore.currentWallet.isDemo,
      });
      event.source?.postMessage(
        {
          type: "@obi/sign-and-broadcast-transaction-response",
          payload: response,
        },
        // @ts-expect-error this is fine
        "*"
      );
    }

    return addEventListener(listener);
  }, [store]);

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
  return () => {
    window.removeEventListener("message", listener);
  };
}
