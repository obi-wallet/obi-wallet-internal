import { PricingTier, RequestObiInAppPurchaseMsg } from "@obi-wallet/common";
import { InAppPurchaseInteractionModal } from "@obi-wallet/mobile";
import { Button, View } from "react-native";

// eslint-disable-next-line import/no-default-export
export default () => {
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
};
