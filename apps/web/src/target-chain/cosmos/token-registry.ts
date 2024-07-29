import { CosmosChainId } from "@/target-chain/cosmos/chains";
import { Asset } from "@chain-registry/types";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
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

  public getNewAsset(id: Caip19AssetId) {
    if (id.includes("/factory:")) {
      const key = id.replace("/factory:", ":factory/").replace("%2F", "/");
      return this.assets[key];
    }

    if (id.includes("/ibc:")) {
      const key = id.replace("/ibc:", ":ibc/").replace("%2F", "/");
      return this.assets[key];
    }

    if (id.includes("/cw20:")) {
      // TODO:
      // const key = id.replace("/cw20", ":cw20");
      // return this.assets[key];
      return null;
    }

    return this.assets[id];
  }

  protected buildAssets(): Record<string, Asset> {
    const result: Record<string, Asset> = {};

    chains.forEach((chain) => {
      const assetList =
        assets.find((a) => {
          return a.chain_name === chain.chain_name;
        })?.assets ?? [];
      assetList.forEach((asset) => {
        const legacyKey = `cosmos:${chain.chain_id}:${asset.base}`;
        result[legacyKey] = asset;
      });

      const slip44 = chain.slip44;
      const nativeTokenId = `cosmos:${chain.chain_id}/slip44:${slip44}`;
      const nativeTokenDenom = chain.fees?.fee_tokens?.[0]?.denom;
      const nativeTokenInfo =
        result[`cosmos:${chain.chain_id}:${nativeTokenDenom}`];

      if (nativeTokenInfo) {
        result[nativeTokenId] = nativeTokenInfo;
      }
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
