import { AbstractAssetProvider, AssetInfo } from "@/asset-provider/abstract";
import { allTargetChainIds, TargetChain } from "@/target-chain";
import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import {
  Caip19AssetId,
  Caip19ChainId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import { fromPairs } from "ramda";
import { undefined, z } from "zod";

const squidChainsResponse = z.object({
  chains: z.array(
    z.object({
      chainId: z.string().or(z.number()),
    }),
  ),
});

const squidTokensResponse = z.object({
  tokens: z.array(
    z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
      logoURI: z.string(),
    }),
  ),
});

export type SquidTokensResponse = z.infer<typeof squidTokensResponse>;

export class SquidAssetProvider extends AbstractAssetProvider {
  protected queryNamespace: QueryClientNamespace<"squid-asset-provider">;

  public constructor() {
    super();
    this.queryNamespace = new QueryClientNamespace("squid-asset-provider", {});
  }

  public async assetInfo(id: Caip19AssetId): Promise<AssetInfo | null> {
    const { chainId: caip2ChainId } = parseCaip19AssetId(id);
    const denom = TargetChain.chainId(caip2ChainId).caip19AssetIdToDenom(id);
    const assets = await this.assets();
    const chainAssets = assets[caip2ChainId]?.tokens;
    const asset = chainAssets?.find((asset) => {
      return asset.address === denom;
    });
    if (asset) {
      return {
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        image: asset.logoURI,
      };
    }
    return null;
  }

  public async assets(): Promise<Record<Caip19ChainId, SquidTokensResponse>> {
    return await queryClient.fetchQuery(this.assetsQuery(undefined));
  }

  protected get assetsQuery() {
    return this.queryNamespace.createQuery({
      name: "assets",
      fn: async () => {
        const response = await fetch("https://api.0xsquid.com/v1/chains");
        const supportedChains = squidChainsResponse.parse(
          await response.json(),
        );
        const supportedChainIds = allTargetChainIds.filter((chainId) => {
          return supportedChains.chains.some((supportedChain) => {
            return (
              `${supportedChain.chainId}` ===
              parseCaip2ChainId(chainId).reference
            );
          });
        });

        return fromPairs(
          await Promise.all(
            supportedChainIds.map(async (chainId) => {
              const { reference } = parseCaip2ChainId(chainId);
              const url = new URL("https://api.0xsquid.com/v1/tokens");
              url.searchParams.append("chainId", reference);
              const response = await fetch(url.toString());
              const tokens = squidTokensResponse.parse(await response.json());
              return [chainId, tokens];
            }),
          ),
        );
      },
      staleTime: { day: 1 },
    });
  }
}
