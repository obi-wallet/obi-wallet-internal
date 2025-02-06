import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import {
  Caip19AssetId,
  Caip2ChainId,
  Caip2ChainIdSchema,
} from "@obi-wallet/sdk-caip";
import BigNumber from "bignumber.js";
import { toPairs } from "ramda";
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

export const AssetRegistryResponse = z.object({
  chainId: Caip2ChainIdSchema,
  denom: z.string(),
  assetId: z.custom<Caip19AssetId>(),
  assetInfo: AssetInfo.nullable(),
  priceInfo: PriceInfo.nullable(),
});

export type AssetRegistryResponse = z.infer<typeof AssetRegistryResponse>;

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
    chainId: Caip2ChainId;
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
        chainId: Caip2ChainId;
        denom: string;
      }) => {
        const url = `https://asset-registry.obiwallet.workers.dev/denom/${encodeURIComponent(chainId)}/${encodeURIComponent(denom)}`;
        const response = await fetch(url);
        if (response.status === 404) {
          return null;
        }
        return AssetRegistryResponse.parse(await response.json());
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
        if (response.status === 404) {
          return null;
        }
        return AssetRegistryResponse.parse(await response.json());
      },
      staleTime: {
        minute: 1,
      },
    });
  }

  public async getCosmosFeeTokens() {
    return await queryClient.fetchQuery(this.cosmosFeeTokensQuery({}));
  }

  public get cosmosFeeTokensQuery() {
    return this.queryNamespace.createQuery({
      name: "cosmos-fee-tokens",
      fn: async (): Promise<
        {
          id: Caip19AssetId;
          chainInfo: { name: string; image: string };
          assetInfo: AssetInfo;
        }[]
      > => {
        const url = `https://asset-registry.obiwallet.workers.dev/index/cosmos-fee-tokens`;
        const response = await fetch(url);
        const pairs = await response.json();

        return toPairs(pairs).flatMap(([chainId, chain]) => {
          return toPairs(chain.feeAssets).flatMap(([assetId, assetInfo]) => {
            return {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              id: `${chainId}/${assetId}` as Caip19AssetId,
              chainInfo: {
                name: chain.name,
                image: chain.image,
              },
              assetInfo,
            };
          });
        });
      },
      staleTime: {
        hour: 1,
      },
    });
  }
}

export class Asset implements AssetRegistryResponse {
  public constructor(protected readonly response: AssetRegistryResponse) {}

  public get chainId() {
    return this.response.chainId;
  }

  public get denom() {
    return this.response.denom;
  }

  public get assetId() {
    return this.response.assetId;
  }

  public get assetInfo() {
    return this.response.assetInfo;
  }

  public get priceInfo() {
    return this.response.priceInfo;
  }

  public rawAmountToPrettyAmount(rawAmount: string) {
    return new BigNumber(rawAmount).dividedBy(10 ** this.decimals).toString(10);
  }

  public prettyAmountToRawAmount(prettyAmount: string) {
    return new BigNumber(prettyAmount)
      .multipliedBy(10 ** this.decimals)
      .toFixed(0, BigNumber.ROUND_DOWN);
  }

  protected get decimals() {
    return this.assetInfo?.decimals ?? 0;
  }
}
