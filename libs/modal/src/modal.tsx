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

  return null;
});

// @ts-expect-error Expose signAndBroadcastTransaction
// This should be handled by an OAuth-like flow in the future.
window["__obi__"] = {
  signAndBroadcastTransaction:
    SignAndBroadcastTransactionUserInteraction.start.bind(
      SignAndBroadcastTransactionUserInteraction
    ),
};
