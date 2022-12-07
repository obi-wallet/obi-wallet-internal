import {
  PricingTier,
  RequestObiInAppPurchasePayload,
} from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import {
  finishTransaction,
  getProducts,
  requestPurchase,
} from "react-native-iap";

import { useStore } from "../stores";

const productIds: Record<PricingTier, string> = {
  [PricingTier.Tier8]: "money.obi.loop.conrad.nft8",
};

export const InAppPurchaseInteractionModal = observer(() => {
  const { inAppPurchaseInteractionStore } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await getProducts({ skus: Object.values(productIds) });
      setReady(true);
    })();
  });

  const data = inAppPurchaseInteractionStore.waitingData?.data;

  if (!data || !ready) return null;

  return <InteractionModalInner data={data} />;
});

const InteractionModalInner = observer(
  ({ data }: { data: RequestObiInAppPurchasePayload }) => {
    const { inAppPurchaseInteractionStore, walletsStore } = useStore();

    useEffect(() => {
      (async () => {
        const recipient = walletsStore.address;
        if (!recipient) return;

        try {
          const response = await requestPurchase({
            sku: productIds[data.pricingTier],
          });
          if (response) {
            await fetch(
              "https://in-app-purchase.obiwallet.workers.dev/verify",
              {
                method: "POST",
                body: JSON.stringify({
                  transactionReceipt: response.transactionReceipt,
                  payload: {
                    ...data.payload,
                    recipient,
                  },
                }),
              }
            );
            await finishTransaction({
              purchase: response,
              isConsumable: true,
            });
            await inAppPurchaseInteractionStore.approveAndWaitEnd({
              success: true,
            });
          }
        } catch (e) {
          await inAppPurchaseInteractionStore.reject();
        }
      })();
    });

    return null;
  }
);
