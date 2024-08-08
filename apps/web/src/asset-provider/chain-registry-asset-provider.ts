import { Asset } from "@chain-registry/types";
import {
  Caip19AssetId,
  Caip19AssetNamespace,
  Caip19AssetReference,
  Caip19ChainId,
} from "@obi-wallet/sdk-caip";
import { assets, chains } from "chain-registry";

import { AbstractAssetProvider } from "./abstract";

export class ChainRegistryAssetProvider extends AbstractAssetProvider {
  protected assets: Record<string, Asset>;

  public constructor() {
    super();
    this.assets = this.initAssets();
  }

  public async assetInfo(id: Caip19AssetId) {
    const asset = this.assets[id];
    if (!asset) return null;

    const denomUnit = asset.denom_units.find((value) => {
      return value.denom === asset.display;
    });

    return {
      name: asset.name,
      symbol: asset.symbol,
      decimals: denomUnit?.exponent ?? 0,
      image: asset.images?.[0]?.svg ?? asset.images?.[0]?.png ?? null,
    };
  }

  protected initAssets(): Record<string, Asset> {
    const chainNameToId: Record<string, Caip19ChainId> = {};
    const result: Record<string, Asset> = {};

    chains.forEach((chain) => {
      chainNameToId[chain.chain_name] = `cosmos:${chain.chain_id}`;
    });

    assets.forEach((assetList) => {
      const chainId = chainNameToId[assetList.chain_name];
      if (!chainId) return;

      assetList.assets.forEach((asset) => {
        const getCaip19AssetIdPartial =
          (): `${Caip19AssetNamespace}:${Caip19AssetReference}` => {
            if (asset.base.includes("cw20:")) {
              return `cw20:${asset.base.replace("cw20:", "")}`;
            }

            if (asset.base.includes("ibc/")) {
              return `ibc:${asset.base.replace("ibc/", "").replace("%2F", "/")}`;
            }

            if (asset.base.includes("factory/")) {
              return `factory:${asset.base.replace("factory/", "").replace("%2F", "/")}`;
            }

            return `native:${asset.base.replace("%2F", "/")}`;
          };
        result[`${chainId}/${getCaip19AssetIdPartial()}`] = asset;
      });
    });

    return result;
  }
}
