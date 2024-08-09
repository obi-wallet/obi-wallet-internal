import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { action, autorun, observable, runInAction, toJS } from "mobx";
import { omit, toPairs } from "ramda";
import { z } from "zod";

const viewingKeySchema = z.string();

export type ViewingKey = z.infer<typeof viewingKeySchema>;

export const viewingKeysSchema = z.record(
  z.custom<Caip19AssetId>(),
  viewingKeySchema,
);

export type ViewingKeys = z.infer<typeof viewingKeysSchema>;

export const viewingKeysPerWalletSchema = z.record(viewingKeysSchema);

export type ViewingKeysPerWallet = z.infer<typeof viewingKeysPerWalletSchema>;

export class ViewingKeysStore {
  @observable protected accessor keys: ViewingKeysPerWallet = {};
  protected readonly kvStore: AbstractKVStore;

  public constructor(kvStore: AbstractKVStore) {
    this.kvStore = kvStore;
    void this.init();
  }

  protected async init() {
    const currentViewKeys = await this.getFromKVStore();

    runInAction(() => {
      this.keys = currentViewKeys;
    });

    autorun(async () => {
      const data = viewingKeysPerWalletSchema.parse(toJS(this.keys));
      await this.kvStore.set("viewing-keys", data);
    });
  }

  public async getFromKVStore(): Promise<ViewingKeysPerWallet> {
    const data = await this.kvStore.get("viewing-keys");
    const result = viewingKeysPerWalletSchema.safeParse(data);
    if (!result.success) return {};
    return result.data;
  }

  public getViewingKeys(address: string): ViewingKeys {
    return this.keys[address] ?? {};
  }

  public getViewingKey({
    address,
    assetId,
  }: {
    address: string;
    assetId: Caip19AssetId;
  }): ViewingKey | null {
    const keys = this.getViewingKeys(address);
    return keys[assetId] ?? null;
  }

  @action
  public setViewingKey({
    address,
    assetId,
    key,
  }: {
    address: string;
    assetId: Caip19AssetId;
    key: ViewingKey;
  }) {
    this.keys = {
      ...this.keys,
      [address]: {
        ...this.getViewingKeys(address),
        [assetId]: key,
      },
    };
  }

  @action
  public removeViewingKey({
    address,
    assetId,
  }: {
    address: string;
    assetId: Caip19AssetId;
  }) {
    this.keys = {
      ...this.keys,
      [address]: omit([assetId], this.getViewingKeys(address)),
    };
  }
}
