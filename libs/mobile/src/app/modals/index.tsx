import { Feature } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { Platform } from "react-native";

import { InAppPurchaseInteractionModal } from "./in-app-purchase-interaction-modal";
import { SignInteractionModal } from "./sign-interaction-modal";
import { TerraSignInteractionModal } from "./terra-sign-interaction-modal";
import { useStore } from "../stores";

export const Modals = observer(function Modals() {
  const { configStore } = useStore();

  return (
    <>
      {Platform.OS === "ios" &&
      configStore.isFeatureEnabled(Feature.InAppPurchases) ? (
        <InAppPurchaseInteractionModal />
      ) : null}
      <SignInteractionModal />
      <TerraSignInteractionModal />
    </>
  );
});
