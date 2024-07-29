import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { action, observable } from "mobx";
import { fromPairs, toPairs } from "ramda";
import { z } from "zod";

const tokenConfigSchema = z.object({
  enabled: z.boolean().optional(),
  assetInfo: z
    .object({
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
      image: z.string().nullable(),
    })
    .optional(),
});

export type TokenConfig = z.infer<typeof tokenConfigSchema>;

export const tokensConfigSchema = z.record(z.string(), tokenConfigSchema);

export type TokensConfig = z.infer<typeof tokensConfigSchema>;

export const tokensConfigPerWalletSchema = z.record(tokensConfigSchema);

export type TokensConfigPerWallet = z.infer<typeof tokensConfigPerWalletSchema>;

export class TokensStore {
  @observable protected accessor config: TokensConfigPerWallet = {};
  protected readonly kvStore: AbstractKVStore;

  public constructor(kvStore: AbstractKVStore) {
    this.kvStore = kvStore;
    void this.init();
  }

  protected async init() {
    // TODO:
  }

  public getTokensConfig(address: string) {
    // TODO: debug statement

    return {
      "cosmos:pacific-1/factory:sei1lwp83awd5d2gt4sfet47khj8cwav2lmqn904fe%2FOIN":
        {
          enabled: false,
          assetInfo: {
            name: "OIN",
            symbol: "OIN",
            decimals: 6,
            image:
              "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
          },
        },
    };

    return this.config[address] ?? {};
  }

  public getTokenConfig({
    address,
    assetId,
  }: {
    address: string;
    assetId: string;
  }): TokenConfig | null {
    const config = this.getTokensConfig(address);
    return config[assetId] ?? null;
  }

  @action setTokenConfig({
    address,
    assetId,
    config,
  }: {
    address: string;
    assetId: string;
    config: TokenConfig;
  }) {
    this.config = {
      ...this.config,
      [address]: {
        ...this.getTokensConfig(address),
        [assetId]: config,
      },
    };
  }

  // TODO: do we even need this?
  public getTokens(address: string): Caip19AssetId[] {
    const config = this.getTokensConfig(address);
    const keys = Object.keys(
      fromPairs(
        toPairs(config).filter(([_, config]) => {
          return config.enabled;
        }),
      ),
    );
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return keys as Caip19AssetId[];
  }
}
