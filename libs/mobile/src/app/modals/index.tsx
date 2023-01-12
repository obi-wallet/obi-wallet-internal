import { Platform } from "react-native";

import { InAppPurchaseInteractionModal } from "./in-app-purchase-interaction-modal";
import { KeplrSignInteractionModal } from "./keplr-sign-interaction-modal";
import { SignInteractionModal } from "./sign-interaction-modal";
import { TerraSignInteractionModal } from "./terra-sign-interaction-modal";

export function Modals() {
  return (
    <>
      {Platform.OS === "ios" ? <InAppPurchaseInteractionModal /> : null}
      <SignInteractionModal />
      <TerraSignInteractionModal />
      <KeplrSignInteractionModal />
    </>
  );
}
