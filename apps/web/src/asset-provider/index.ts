import { AstroportAssetProvider } from "@/astroport";
import { SkipAssetProvider } from "@/skip";
import { SquidAssetProvider } from "@/squid";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { uniq } from "ramda";

import { AbstractAssetProvider } from "./abstract";
import { ChainRegistryAssetProvider } from "./chain-registry-asset-provider";

export class AssetProvider implements AbstractAssetProvider {
  protected static instance: AssetProvider | null = null;
  protected sources: AbstractAssetProvider[];

  protected constructor() {
    this.sources = [
      new AstroportAssetProvider(),
      new ChainRegistryAssetProvider(),
      new SkipAssetProvider(),
      new SquidAssetProvider(),
    ];
  }

  public static getInstance(): AssetProvider {
    if (!AssetProvider.instance) {
      AssetProvider.instance = new AssetProvider();
    }

    return AssetProvider.instance;
  }

  public async supportedAssets() {
    const assets = await Promise.all(
      this.sources.map((source) => {
        return source.supportedAssets();
      }),
    );
    return uniq(assets.flat());
  }

  public async assetInfo(id: Caip19AssetId) {
    for (const source of this.sources) {
      const asset = await source.assetInfo(id);
      if (asset) return asset;
    }

    return null;
  }
}
