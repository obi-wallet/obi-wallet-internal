import { AbstractPriceProvider, PriceInfo } from "@/price-provider/abstract";
import { SkipAssetProvider } from "@/skip/asset-provider";
import { TargetChain } from "@/target-chain";
import { isCosmosChainId } from "@/target-chain/cosmos/chains";
import { isEip155ChainId } from "@/target-chain/eip-155/chains";
import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import {
  Caip19AssetId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";
import BigNumber from "bignumber.js";
import { z } from "zod";

export class SkipPriceProvider extends AbstractPriceProvider {
  protected queryNamespace: QueryClientNamespace<"skip-price-provider">;
  protected assetProvider: SkipAssetProvider;

  public constructor() {
    super();
    this.queryNamespace = new QueryClientNamespace("skip-price-provider", {});
    this.assetProvider = new SkipAssetProvider();
  }

  public async priceInfo(id: Caip19AssetId): Promise<PriceInfo | null> {
    return await queryClient.fetchQuery(this.priceInfoQuery(id));
  }

  protected get priceInfoQuery() {
    return this.queryNamespace.createQuery({
      name: "priceInfo",
      fn: async (id: Caip19AssetId) => {
        const { chainId: caip2ChainId } = parseCaip19AssetId(id);
        const { reference } = parseCaip2ChainId(caip2ChainId);
        const denom =
          TargetChain.chainId(caip2ChainId).caip19AssetIdToDenom(id);
        const assetInfo = await this.assetProvider.assetInfo(id);

        const getDestAssetInfo = () => {
          if (isCosmosChainId(caip2ChainId)) {
            // axlUSDC on SEI
            return {
              dest_asset_denom:
                "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
              dest_asset_chain_id: "pacific-1",
            };
          }

          if (isEip155ChainId(caip2ChainId)) {
            // USDC on Ethereum
            return {
              dest_asset_denom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              dest_asset_chain_id: "1",
            };
          }
        };
        const destAssetInfo = getDestAssetInfo();

        if (assetInfo && destAssetInfo) {
          const amountIn = new BigNumber(1)
            .multipliedBy(10 ** assetInfo.decimals)
            .toFixed(0);
          const body = {
            source_asset_chain_id: reference,
            amount_in: amountIn,
            source_asset_denom: denom,
            ...destAssetInfo,
            allow_unsafe: true,
          };
          const response = await fetch(
            "https://api.skip.money/v2/fungible/route",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: serialize(body),
            },
          );
          const schema = z.object({
            usd_amount_out: z.string(),
          });
          const data = await response.json();
          const { usd_amount_out } = schema.parse(data);
          return { usdValue: usd_amount_out };
        }

        return null;
      },
      staleTime: { minutes: 5 },
    });
  }
}
