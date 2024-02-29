import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { Asset } from "@chain-registry/types";
import { assets, chains } from "chain-registry";

import astroportTokensInjective from "./astroport-token-lists/injective.json";
import astroportTokensNeutron from "./astroport-token-lists/neutron.json";
import astroportTokensOsmosis from "./astroport-token-lists/osmosis.json";
import astroportTokensSei from "./astroport-token-lists/sei.json";

export class CosmosSdkTokenRegistry {
  protected static instance: CosmosSdkTokenRegistry | null = null;
  protected assets: Record<string, Asset>;

  protected constructor() {
    this.assets = this.buildAssets();
  }

  public static getInstance(): CosmosSdkTokenRegistry {
    if (!CosmosSdkTokenRegistry.instance) {
      CosmosSdkTokenRegistry.instance = new CosmosSdkTokenRegistry();
    }

    return CosmosSdkTokenRegistry.instance;
  }

  public getAsset({
    chainId,
    denom,
  }: {
    chainId: CosmosSdkChainId;
    denom: string;
  }) {
    return this.assets[`${chainId}:${denom}`];
  }

  protected buildAssets(): Record<string, Asset> {
    const result: Record<string, Asset> = {};

    chains.forEach((chain) => {
      const assetList =
        assets.find((a) => a.chain_name === chain.chain_name)?.assets ?? [];
      assetList.forEach((asset) => {
        const key = `${chain.chain_id}:${asset.base}`;
        result[key] = asset;
      });
    });

    addAstroportTokens(CosmosSdkChainId.Inj, astroportTokensInjective);
    addAstroportTokens(CosmosSdkChainId.Neutron, astroportTokensNeutron);
    addAstroportTokens(CosmosSdkChainId.Osmosis, astroportTokensOsmosis);
    addAstroportTokens(CosmosSdkChainId.Sei, astroportTokensSei);

    return result;

    function addAstroportTokens(
      chainId: CosmosSdkChainId,
      tokens: { token: string; originDenom?: string; originChainId?: string }[],
    ) {
      tokens.forEach(({ token, originDenom, originChainId }) => {
        if (token && originDenom && originChainId) {
          const key = `${chainId}:${token}`;
          const originKey = `${originChainId}:${originDenom}`;
          const origin = result[originKey];
          if (origin) {
            result[key] = origin;
          }
        }
      });
    }
  }
}
