import { AbstractAssetProvider, AssetInfo } from "@/asset-provider/abstract";
import { CosmosChainId } from "@/target-chain/cosmos/chains";
import {
  Caip19AssetId,
  Caip19AssetNamespace,
  Caip19AssetReference,
} from "@obi-wallet/sdk-caip";

import tokensInjective from "./token-lists/injective.json";
import tokensNeutron from "./token-lists/neutron.json";
import tokensOsmosis from "./token-lists/osmosis.json";
import tokensSei from "./token-lists/sei.json";

export class AstroportAssetProvider extends AbstractAssetProvider {
  protected assets: Record<Caip19AssetId, AssetInfo>;

  public constructor() {
    super();
    this.assets = this.initAssets();
  }

  public async assetInfo(id: Caip19AssetId) {
    return this.assets[id] ?? null;
  }

  protected initAssets(): Record<Caip19AssetId, AssetInfo> {
    const result: Record<Caip19AssetId, AssetInfo> = {};

    const tokenLists = [
      {
        chainId: CosmosChainId.Inj,
        tokens: tokensInjective,
        prefix: "inj",
      },
      {
        chainId: CosmosChainId.Neutron,
        tokens: tokensNeutron,
        prefix: "neutron",
      },
      {
        chainId: CosmosChainId.Osmosis,
        tokens: tokensOsmosis,
        prefix: "osmo",
      },
      {
        chainId: CosmosChainId.Sei,
        tokens: tokensSei,
        prefix: "sei",
      },
    ];

    tokenLists.forEach(({ chainId, tokens, prefix }) => {
      tokens.forEach((token) => {
        const getCaip19AssetIdPartial =
          (): `${Caip19AssetNamespace}:${Caip19AssetReference}` => {
            if (token.token.startsWith("ibc/")) {
              return `ibc:${token.token.substring("ibc/".length).replace("/", "%2F")}`;
            }

            if (token.token.startsWith("factory/")) {
              return `factory:${token.token.substring("factory/".length).replace("/", "%2F")}`;
            }

            if (token.token.startsWith(prefix)) {
              return `cw20:${token.token.replace("cw20:", "")}`;
            }

            return `native:${token.token.replace("/", "%2F")}`;
          };

        let image = token.icon ?? null;
        if (image && image.startsWith("/")) {
          image = `https://raw.githubusercontent.com/astroport-fi/astroport-token-lists/main${image}`;
        }

        result[`${chainId}/${getCaip19AssetIdPartial()}`] = {
          name: token.symbol,
          symbol: token.symbol,
          decimals: token.decimals,
          image,
        };
      });
    });

    return result;
  }
}
