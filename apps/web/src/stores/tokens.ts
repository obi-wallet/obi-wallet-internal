import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { action, autorun, observable, runInAction, toJS } from "mobx";
import { omit, toPairs } from "ramda";
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

export const tokensConfigSchema = z.record(
  z.custom<Caip19AssetId>(),
  tokenConfigSchema,
);

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
    const currentConfig = await this.getFromKVStore();

    runInAction(() => {
      this.config = currentConfig;
    });

    autorun(async () => {
      const data = tokensConfigPerWalletSchema.parse(toJS(this.config));
      await this.kvStore.set("tokens-config", data);
    });
  }

  public async getFromKVStore(): Promise<TokensConfigPerWallet> {
    const data = await this.kvStore.get("tokens-config");
    const result = tokensConfigPerWalletSchema.safeParse(data);
    if (!result.success) return {};
    return result.data;
  }

  public getTokensConfig(id: string): TokensConfig {
    return this.config[id] ?? {};
  }

  public getTokenConfig({
    id,
    assetId,
  }: {
    id: string;
    assetId: Caip19AssetId;
  }): TokenConfig | null {
    const config = this.getTokensConfig(id);
    return config[assetId] ?? null;
  }

  @action
  public setTokenConfig({
    id,
    assetId,
    config,
  }: {
    id: string;
    assetId: Caip19AssetId;
    config: TokenConfig;
  }) {
    this.config = {
      ...this.config,
      [id]: {
        ...this.getTokensConfig(id),
        [assetId]: config,
      },
    };
  }

  @action
  public removeTokenConfig({
    id,
    assetId,
  }: {
    id: string;
    assetId: Caip19AssetId;
  }) {
    this.config = {
      ...this.config,
      [id]: omit([assetId], this.getTokensConfig(id)),
    };
  }

  // TODO: do we even need this?
  public getTokens(id: string): Caip19AssetId[] {
    const config = this.getTokensConfig(id);
    return toPairs(config)
      .filter(([_, config]) => {
        return config?.enabled;
      })
      .map(([key]) => {
        return key;
      });
  }
}
