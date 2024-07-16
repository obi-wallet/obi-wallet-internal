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

export class TargetChainsStore {
  @observable protected accessor config: TargetChainsConfigPerWallet = {};
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
      const data = targetChainsConfigPerWalletSchema.parse(toJS(this.config));
      await this.kvStore.set("target-chains-config", data);
    });
  }

  public async getFromKVStore(): Promise<TargetChainsConfigPerWallet> {
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
        ...this.config[address],
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
}
