import { TargetChainId } from "@/target-chain";
import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import { Caip19AssetId, Caip2ChainIdSchema } from "@obi-wallet/sdk-caip";
import { z } from "zod";

export const AssetInfo = z.object({
  _source: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  image: z.string().nullable(),
});

export type AssetInfo = z.infer<typeof AssetInfo>;

export const PriceInfo = z.object({
  _source: z.string(),
  usdValue: z.string(),
});

export type PriceInfo = z.infer<typeof PriceInfo>;

const TokenInfoResponse = z.object({
  chainId: Caip2ChainIdSchema,
  denom: z.string(),
  assetId: z.custom<Caip19AssetId>(),
  assetInfo: AssetInfo.nullable(),
  priceInfo: PriceInfo.nullable(),
});

export class AssetRegistry {
  protected queryNamespace: QueryClientNamespace<"asset-registry">;
  protected static instance: AssetRegistry | null = null;

  public constructor() {
    this.queryNamespace = new QueryClientNamespace("asset-registry", {});
  }

  public static getInstance(): AssetRegistry {
    if (!AssetRegistry.instance) {
      AssetRegistry.instance = new AssetRegistry();
    }

    return AssetRegistry.instance;
  }

  public async byDenom({
    chainId,
    denom,
  }: {
    chainId: TargetChainId;
    denom: string;
  }) {
    return await queryClient.fetchQuery(this.byDenomQuery({ chainId, denom }));
  }

  protected get byDenomQuery() {
    return this.queryNamespace.createQuery({
      name: "by-denom",
      fn: async ({
        chainId,
        denom,
      }: {
        chainId: TargetChainId;
        denom: string;
      }) => {
        const url = `https://asset-registry.obiwallet.workers.dev/denom/${encodeURIComponent(chainId)}/${encodeURIComponent(denom)}`;
        const response = await fetch(url);
        return TokenInfoResponse.parse(await response.json());
      },
      staleTime: {
        minute: 1,
      },
    });
  }

  public async byId(id: Caip19AssetId) {
    return await queryClient.fetchQuery(this.byIdQuery(id));
  }

  protected get byIdQuery() {
    return this.queryNamespace.createQuery({
      name: "by-id",
      fn: async (id: Caip19AssetId) => {
        const url = `https://asset-registry.obiwallet.workers.dev/id/${encodeURIComponent(id)}`;
        const response = await fetch(url);
        return TokenInfoResponse.parse(await response.json());
      },
      staleTime: {
        minute: 1,
      },
    });
  }
}
