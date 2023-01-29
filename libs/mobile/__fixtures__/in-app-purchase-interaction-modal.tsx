import { PricingTier, RequestObiInAppPurchaseMsg } from "@obi-wallet/common";
import { Button, View } from "react-native";

import { InAppPurchaseInteractionModal } from "../src";

export default function InAppPurchaseInteractionModalFixture() {
  return (
    <>
      <View style={{ paddingTop: 50 }}>
        <Button
          title="Request In-App Purchase"
          onPress={async () => {
            await RequestObiInAppPurchaseMsg.send({
              pricingTier: PricingTier.Tier8,
              payload: {
                collectionAddress:
                  "juno1vyqzx8s3wp9tzvm98aq7tda6uwcqc6q93resya9sxawfmm9vje9q473nay",
                amount: "0.01",
              },
            });
          }}
          color="#ffffff"
        />
      </View>
      <InAppPurchaseInteractionModal />
    </>
  );
}
