import { allTargetChainIds, TargetChain, TargetChainId } from "@/target-chain";
import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import { Caip2ChainIdSchema } from "@obi-wallet/sdk-caip";
import { action, autorun, observable, runInAction, toJS } from "mobx";
import { z } from "zod";

const targetChainConfigSchema = z.object({
  enabled: z.boolean().optional(),
});

export type TargetChainConfig = z.TypeOf<typeof targetChainConfigSchema>;

const targetChainsConfigSchema = z.record(
  Caip2ChainIdSchema,
  targetChainConfigSchema,
);

const targetChainsConfigPerWalletSchema = z.record(targetChainsConfigSchema);

export type TargetChainsConfigPerWallet = z.infer<
  typeof targetChainsConfigPerWalletSchema
>;

const lastUsedTargetChainIdPerWalletSchema = z.record(Caip2ChainIdSchema);

export type LastUsedTargetChainIdPerWallet = z.infer<
  typeof lastUsedTargetChainIdPerWalletSchema
>;

export class TargetChainsStore {
  @observable protected accessor config: TargetChainsConfigPerWallet = {};
  @observable
  protected accessor lastUsedTargetChainId: LastUsedTargetChainIdPerWallet = {};
  protected readonly kvStore: AbstractKVStore;

  public constructor(kvStore: AbstractKVStore) {
    this.kvStore = kvStore;
    void this.init();
  }

  protected async init() {
    const [currentConfig, lastUsedTargetChainId] = await Promise.all([
      this.getTargetChainsConfigFromKVStore(),
      this.getLastUsedTargetChainIdFromKVStore(),
    ]);

    runInAction(() => {
      this.config = currentConfig;
      this.lastUsedTargetChainId = lastUsedTargetChainId;
    });

    autorun(async () => {
      await Promise.all([
        this.kvStore.set(
          "target-chains-config",
          targetChainsConfigPerWalletSchema.parse(toJS(this.config)),
        ),
        this.kvStore.set(
          "last-used-target-chain-id",
          lastUsedTargetChainIdPerWalletSchema.parse(
            toJS(this.lastUsedTargetChainId),
          ),
        ),
      ]);
    });
  }

  @action
  public changeId(previousId: string, newId: string) {
    const previousTargetChainsConfig = this.config[previousId];
    const previousLastUsedTargetChainId =
      this.lastUsedTargetChainId[previousId];
    if (previousTargetChainsConfig) {
      this.config[newId] = previousTargetChainsConfig;
      delete this.config[previousId];
    }
    if (previousLastUsedTargetChainId) {
      this.lastUsedTargetChainId[newId] = previousLastUsedTargetChainId;
      delete this.lastUsedTargetChainId[previousId];
    }
  }

  protected async getLastUsedTargetChainIdFromKVStore(): Promise<LastUsedTargetChainIdPerWallet> {
    const data = await this.kvStore.get("last-used-target-chain-id");
    const result = lastUsedTargetChainIdPerWalletSchema.safeParse(data);
    if (!result.success) return {};
    return result.data;
  }

  protected async getTargetChainsConfigFromKVStore(): Promise<TargetChainsConfigPerWallet> {
    const data = await this.kvStore.get("target-chains-config");
    const result = targetChainsConfigPerWalletSchema.safeParse(data);
    if (!result.success) return {};
    return result.data;
  }

  public getTargetChainsConfig(id: string) {
    return this.config[id] ?? {};
  }

  public getTargetChainConfig({
    id,
    chainId,
  }: {
    id: string;
    chainId: TargetChainId;
  }): TargetChainConfig {
    const config = this.getTargetChainsConfig(id);
    return config[chainId] ?? {};
  }

  @action
  public setTargetChainConfig({
    id,
    chainId,
    config,
  }: {
    id: string;
    chainId: TargetChainId;
    config: TargetChainConfig;
  }) {
    this.config = {
      ...this.config,
      [id]: {
        ...this.getTargetChainsConfig(id),
        [chainId]: config,
      },
    };
  }

  public getTargetChains(id: string) {
    return allTargetChainIds.map((chainId) => {
      const targetChain = TargetChain.chainId(chainId);
      const config = this.getTargetChainConfig({ id, chainId });
      const enabled = config?.enabled ?? !targetChain.disabled;
      return {
        id: chainId,
        targetChain,
        enabled,
        config,
      };
    });
  }

  public getLastUsedTargetChainId(id: string) {
    return this.lastUsedTargetChainId[id];
  }

  @action
  public setLastUsedTargetChainId({
    id,
    chainId,
  }: {
    id: string;
    chainId: TargetChainId;
  }) {
    this.lastUsedTargetChainId = {
      ...this.lastUsedTargetChainId,
      [id]: chainId,
    };
  }
}
