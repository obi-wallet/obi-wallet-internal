import { Modals, OnCloseContext, useStore } from "@obi-wallet/common";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { CustomTheme } from "@obi-wallet/theme";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { Container } from "./container";
import { StateRenderer } from "./state-renderer";

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
  const { walletsStore } = useStore();

  useEffect(() => {
    return autorun(() => {
      // Expose current wallet address (or null) to the parent window
      window.parent?.postMessage(
        {
          type: "@obi/current-wallet",
          address: walletsStore.address,
        },
        "*"
      );
    });
  }, [walletsStore]);

  useEffect(() => {
    async function listener(event: MessageEvent) {
      if (event.data.type !== "@obi/sign-and-broadcast-transaction") return;
      if (!walletsStore.currentWallet) return;

      const response = await SignAndBroadcastTransactionUserInteraction.start({
        messages: event.data.payload,
        cancelable: true,
        walletMeta: walletsStore.currentWallet.meta,
        demoMode: walletsStore.currentWallet.isDemo,
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
    window.addEventListener("message", listener, false);
    return () => {
      window.removeEventListener("message", listener);
    };
  }, [walletsStore]);

  return null;
});

function onClose() {
  window.parent?.postMessage(
    {
      type: "@obi/close",
    },
    "*"
  );
}
