import { Modals, useStore } from "@obi-wallet/common";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { Container } from "./container";
import { StateRenderer } from "./state-renderer";

// eslint-disable-next-line mobx/missing-observer
export function Modal() {
  return (
    <Container>
      <ModalWithoutProvider />
    </Container>
  );
}

export const ModalWithoutProvider = observer(function ModalWithoutProvider() {
  return (
    <>
      <StateRenderer />
      <Modals />
      <MessageHandlers />
    </>
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
      const response = await SignAndBroadcastTransactionUserInteraction.start(
        event.data.payload
      );
      event.source?.postMessage({
        type: "@obi/sign-and-broadcast-transaction-response",
        payload: response,
      });
    }
    window.addEventListener("message", listener, false);
    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  return null;
});
