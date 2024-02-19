import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { Asset } from "@chain-registry/types";
import { chains, assets } from "chain-registry";

import astroportSeiTokens from "./astroport-token-lists/sei.json";

export function buildAssets() {
  const result: Record<string, Asset> = {};

  chains.forEach((chain) => {
    const assetList =
      assets.find((a) => a.chain_name === chain.chain_name)?.assets ?? [];
    assetList.forEach((asset) => {
      const key = `${chain.chain_id}:${asset.base}`;
      result[key] = asset;
    });
  });

  // Add Astroport tokens for Sei
  astroportSeiTokens.forEach(({ token, originDenom, originChainId }) => {
    if (token && originDenom && originChainId) {
      const key = `${CosmosSdkChainId.Sei}:${token}`;
      const originKey = `${originChainId}:${originDenom}`;
      const origin = result[originKey];
      if (origin) {
        result[key] = origin;
      }
    }
  });

  return result;
}
