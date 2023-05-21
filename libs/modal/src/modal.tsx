import { Modals } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import { Container } from "./container";
import { StateRenderer } from "./state-renderer";

// eslint-disable-next-line mobx/missing-observer
export function Modal() {
  return (
    <Container>
      <ModalWithoutProvider />
      <Modals />
    </Container>
  );
}

export const ModalWithoutProvider = observer(function ModalWithoutProvider() {
  return <StateRenderer />;
});
