import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { action, autorun, observable, runInAction, toJS } from "mobx";
import { omit } from "ramda";
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

  public getViewingKeys(id: string): ViewingKeys {
    return this.keys[id] ?? {};
  }

  public getViewingKey({
    id,
    assetId,
  }: {
    id: string;
    assetId: Caip19AssetId;
  }): ViewingKey | null {
    const keys = this.getViewingKeys(id);
    return keys[assetId] ?? null;
  }

  @action
  public setViewingKey({
    id,
    assetId,
    key,
  }: {
    id: string;
    assetId: Caip19AssetId;
    key: ViewingKey;
  }) {
    this.keys = {
      ...this.keys,
      [id]: {
        ...this.getViewingKeys(id),
        [assetId]: key,
      },
    };
  }

  @action
  public removeViewingKey({
    id,
    assetId,
  }: {
    id: string;
    assetId: Caip19AssetId;
  }) {
    this.keys = {
      ...this.keys,
      [id]: omit([assetId], this.getViewingKeys(id)),
    };
  }

  @action
  public changeId(previousId: string, newId: string) {
    const previousViewingKeys = this.keys[previousId];
    if (previousViewingKeys) {
      this.keys[newId] = previousViewingKeys;
      delete this.keys[previousId];
    }
  }
}
