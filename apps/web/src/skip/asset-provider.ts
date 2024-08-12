import { AbstractAssetProvider, AssetInfo } from "@/asset-provider/abstract";
import { allTargetChainIds, TargetChain } from "@/target-chain";
import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import {
  Caip19AssetId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import { undefined, z } from "zod";

const skipFungibleAssetsResponse = z.object({
  chain_to_assets_map: z.record(
    z.object({
      assets: z.array(
        z.object({
          denom: z.string(),
          name: z.string(),
          symbol: z.string(),
          decimals: z.number(),
          logo_uri: z.string(),
        }),
      ),
    }),
  ),
});

export type SkipFungibleAssetsResponse = z.infer<
  typeof skipFungibleAssetsResponse
>;

export class SkipAssetProvider extends AbstractAssetProvider {
  protected queryNamespace: QueryClientNamespace<"skip-asset-provider">;

  public constructor() {
    super();
    this.queryNamespace = new QueryClientNamespace("skip-asset-provider", {});
  }

  public async supportedAssets(): Promise<Caip19AssetId[]> {
    const assets = await this.assets();
    return allTargetChainIds.flatMap((chainId) => {
      return (
        assets.chain_to_assets_map[parseCaip2ChainId(chainId).reference]
          ?.assets ?? []
      )
        .map((asset) => {
          return TargetChain.chainId(chainId).denomToCaip19AssetId(asset.denom);
        })
        .filter((id): id is Caip19AssetId => {
          return id !== null;
        });
    });
  }

  public async assetInfo(id: Caip19AssetId): Promise<AssetInfo | null> {
    const { chainId: caip2ChainId } = parseCaip19AssetId(id);
    const { reference } = parseCaip2ChainId(caip2ChainId);
    const denom = TargetChain.chainId(caip2ChainId).caip19AssetIdToDenom(id);
    const assets = await this.assets();
    const chainAssets = assets.chain_to_assets_map[reference]?.assets;
    const asset = chainAssets?.find((asset) => {
      return asset.denom === denom;
    });
    if (asset) {
      return {
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        image: asset.logo_uri,
      };
    }
    return null;
  }

  public async assets(): Promise<SkipFungibleAssetsResponse> {
    return await queryClient.fetchQuery(this.assetsQuery(undefined));
  }

  protected get assetsQuery() {
    return this.queryNamespace.createQuery({
      name: "assets",
      fn: async () => {
        const url = new URL("https://api.skip.money/v2/fungible/assets");

        const chainIds = allTargetChainIds.map((chainId) => {
          return parseCaip2ChainId(chainId).reference;
        });
        chainIds.forEach((chainId) => {
          url.searchParams.append("chain_ids", chainId);
        });
        url.searchParams.append("include_evm_assets", "true");
        url.searchParams.append("include_ibc_assets", "true");

        const response = await fetch(url.toString());
        return skipFungibleAssetsResponse.parse(await response.json());
      },
      staleTime: { day: 1 },
    });
  }
}
