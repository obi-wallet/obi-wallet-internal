import { AbstractPriceProvider, PriceInfo } from "@/price-provider/abstract";
import { TargetChain } from "@/target-chain";
import { isEip155ChainId } from "@/target-chain/eip-155/chains";
import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import {
  Caip19AssetId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import { z } from "zod";

import { SquidAssetProvider } from "./asset-provider";

export class SquidPriceProvider extends AbstractPriceProvider {
  protected queryNamespace: QueryClientNamespace<"squid-price-provider">;
  protected assetProvider: SquidAssetProvider;

  public constructor() {
    super();
    this.queryNamespace = new QueryClientNamespace("squid-price-provider", {});
    this.assetProvider = new SquidAssetProvider();
  }

  public async priceInfo(id: Caip19AssetId): Promise<PriceInfo | null> {
    return await queryClient.fetchQuery(this.priceInfoQuery(id));
  }

  protected get priceInfoQuery() {
    return this.queryNamespace.createQuery({
      name: "priceInfo",
      fn: async (id: Caip19AssetId) => {
        const { chainId: caip2ChainId } = parseCaip19AssetId(id);
        const { namespace, reference } = parseCaip2ChainId(caip2ChainId);
        const denom =
          TargetChain.chainId(caip2ChainId).caip19AssetIdToDenom(id);
        const assetInfo = await this.assetProvider.assetInfo(id);

        if (assetInfo) {
          const referenceToUse =
            isEip155ChainId(caip2ChainId) && namespace === "native"
              ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              : reference;
          const url = `https://api.0xsquid.com/v1/token-price?chainId=${referenceToUse}&tokenAddress=${denom}`;
          const response = await fetch(url);
          const schema = z.object({
            price: z.number(),
          });
          const { price } = schema.parse(await response.json());
          return { usdValue: price.toString(10) };
        }

        return null;
      },
      staleTime: { minutes: 5 },
    });
  }
}
