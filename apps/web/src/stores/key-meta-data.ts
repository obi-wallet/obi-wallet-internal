import { AbstractKVStore } from "@obi-wallet/headless-ui";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { action, autorun, observable, runInAction, toJS } from "mobx";
import { z } from "zod";

const SingleKeyMetaData = z.object({
  name: z.string().optional(),
});

export type SingleKeyMetaData = z.TypeOf<typeof SingleKeyMetaData>;

const KeyMetaData = z.record(SingleKeyMetaData);

export type KeyMetaData = z.TypeOf<typeof KeyMetaData>;

const KeyMetaDataPerWallet = z.record(KeyMetaData);

export type KeyMetaDataPerWallet = z.TypeOf<typeof KeyMetaDataPerWallet>;

export class KeyMetaDataStore {
  @observable protected accessor keyMetaDataPerWallet: KeyMetaDataPerWallet =
    {};
  protected readonly kvStore: AbstractKVStore;

  public constructor(KVStore: AbstractKVStore) {
    this.kvStore = KVStore;
    void this.init();
  }

  protected async init() {
    const currentKeyMetaData = await this.getFromKVStore();

    runInAction(() => {
      this.keyMetaDataPerWallet = currentKeyMetaData;
    });

    autorun(async () => {
      const data = KeyMetaDataPerWallet.parse(toJS(this.keyMetaDataPerWallet));
      await this.kvStore.set("key-meta-data", data);
    });
  }

  public getKeyMetaData(address: string): KeyMetaData {
    return this.keyMetaDataPerWallet[address] ?? {};
  }

  public getSingleKeyMetaData(
    address: string,
    publicKey: Secp256k1PublicKey,
  ): SingleKeyMetaData {
    return this.getKeyMetaData(address)[publicKey.value] ?? {};
  }

  @action
  public setKeyMetaData(address: string, keyMetaData: KeyMetaData) {
    this.keyMetaDataPerWallet[address] = keyMetaData;
  }

  @action
  public setSingleKeyMetaData(
    address: string,
    publicKey: Secp256k1PublicKey,
    singleKeyMetaData: SingleKeyMetaData,
  ) {
    this.setKeyMetaData(address, {
      ...this.getKeyMetaData(address),
      [publicKey.value]: singleKeyMetaData,
    });
  }

  public async getFromKVStore(): Promise<KeyMetaDataPerWallet> {
    const data = await this.kvStore.get("key-meta-data");
    const result = KeyMetaDataPerWallet.safeParse(data);
    if (!result.success) return {};
    return result.data;
  }
}
