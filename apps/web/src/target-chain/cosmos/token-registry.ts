import { CosmosChainId } from "@/target-chain/cosmos/chains";
import { Asset } from "@chain-registry/types";
import { assets, chains } from "chain-registry";

import astroportTokensInjective from "./astroport-token-lists/injective.json";
import astroportTokensNeutron from "./astroport-token-lists/neutron.json";
import astroportTokensOsmosis from "./astroport-token-lists/osmosis.json";
import astroportTokensSei from "./astroport-token-lists/sei.json";

export class CosmosTokenRegistry {
  protected static instance: CosmosTokenRegistry | null = null;
  protected assets: Record<string, Asset>;

  protected constructor() {
    this.assets = this.buildAssets();
  }

  public static getInstance(): CosmosTokenRegistry {
    if (!CosmosTokenRegistry.instance) {
      CosmosTokenRegistry.instance = new CosmosTokenRegistry();
    }

    return CosmosTokenRegistry.instance;
  }

  public getAsset({
    chainId,
    denom,
  }: {
    chainId: CosmosChainId;
    denom: string;
  }) {
    return this.assets[`${chainId}:${denom}`];
  }

  protected buildAssets(): Record<string, Asset> {
    const result: Record<string, Asset> = {};

    chains.forEach((chain) => {
      const assetList =
        assets.find((a) => {
          return a.chain_name === chain.chain_name;
        })?.assets ?? [];
      assetList.forEach((asset) => {
        const key = `cosmos:${chain.chain_id}:${asset.base}`;
        result[key] = asset;
      });
    });

    addAstroportTokens(CosmosChainId.Inj, astroportTokensInjective);
    addAstroportTokens(CosmosChainId.Neutron, astroportTokensNeutron);
    addAstroportTokens(CosmosChainId.Osmosis, astroportTokensOsmosis);
    addAstroportTokens(CosmosChainId.Sei, astroportTokensSei);

    return result;

    function addAstroportTokens(
      chainId: CosmosChainId,
      tokens: { token: string; originDenom?: string; originChainId?: string }[],
    ) {
      tokens.forEach(({ token, originDenom, originChainId }) => {
        if (token && originDenom && originChainId) {
          const key = `${chainId}:${token}`;
          const originKey = `cosmos:${originChainId}:${originDenom}`;
          const origin = result[originKey];
          if (origin) {
            result[key] = origin;
          }
        }
      });
    }
  }
}
