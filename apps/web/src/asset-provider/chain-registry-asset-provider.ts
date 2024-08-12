import { TargetChain } from "@/target-chain";
import { isCosmosChainId } from "@/target-chain/cosmos/chains";
import { isEip155ChainId } from "@/target-chain/eip-155/chains";
import { Asset } from "@chain-registry/types";
import { Caip19AssetId, Caip19ChainId } from "@obi-wallet/sdk-caip";
import { assets, chains } from "chain-registry";

import { AbstractAssetProvider } from "./abstract";

export class ChainRegistryAssetProvider extends AbstractAssetProvider {
  protected assets: Record<Caip19AssetId, Asset>;

  public constructor() {
    super();
    this.assets = this.initAssets();
  }

  public async supportedAssets(): Promise<Caip19AssetId[]> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return Object.keys(this.assets) as Caip19AssetId[];
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

  protected initAssets(): Record<Caip19AssetId, Asset> {
    const chainNameToId: Record<string, Caip19ChainId> = {};
    const result: Record<Caip19AssetId, Asset> = {};

    chains.forEach((chain) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const chainType = (chain as unknown as { chain_type: string }).chain_type;
      switch (chainType) {
        case "cosmos": {
          const chainId = `cosmos:${chain.chain_id}`;
          if (isCosmosChainId(chainId)) {
            chainNameToId[chain.chain_name] = chainId;
          }
          break;
        }
        case "eip155": {
          const chainId = `eip155:${chain.chain_id}`;
          if (isEip155ChainId(chainId)) {
            chainNameToId[chain.chain_name] = chainId;
          }
          break;
        }
      }
    });

    assets.forEach((assetList) => {
      const chainId = chainNameToId[assetList.chain_name];
      if (!chainId) return;

      assetList.assets.forEach((asset) => {
        const targetChain = TargetChain.chainId(chainId);
        const id = targetChain.denomToCaip19AssetId(asset.base);
        if (id) {
          result[id] = asset;
        }
      });
    });

    return result;
  }
}
