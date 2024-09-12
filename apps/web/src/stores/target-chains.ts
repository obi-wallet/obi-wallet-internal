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

  public getTargetChainsConfig(address: string) {
    return this.config[address] ?? {};
  }

  public getTargetChainConfig({
    address,
    chainId,
  }: {
    address: string;
    chainId: TargetChainId;
  }): TargetChainConfig {
    const config = this.getTargetChainsConfig(address);
    return config[chainId] ?? {};
  }

  @action
  public setTargetChainConfig({
    address,
    chainId,
    config,
  }: {
    address: string;
    chainId: TargetChainId;
    config: TargetChainConfig;
  }) {
    this.config = {
      ...this.config,
      [address]: {
        ...this.getTargetChainsConfig(address),
        [chainId]: config,
      },
    };
  }

  public getTargetChains(address: string) {
    return allTargetChainIds.map((chainId) => {
      const targetChain = TargetChain.chainId(chainId);
      const config = this.getTargetChainConfig({ address, chainId });
      const enabled = config?.enabled ?? !targetChain.disabled;
      return {
        id: chainId,
        targetChain,
        enabled,
        config,
      };
    });
  }

  public getLastUsedTargetChainId(address: string) {
    return this.lastUsedTargetChainId[address];
  }

  @action
  public setLastUsedTargetChainId({
    address,
    chainId,
  }: {
    address: string;
    chainId: TargetChainId;
  }) {
    this.lastUsedTargetChainId = {
      ...this.lastUsedTargetChainId,
      [address]: chainId,
    };
  }
}
