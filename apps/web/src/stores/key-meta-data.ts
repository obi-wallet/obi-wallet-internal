import { AbstractKVStore } from "@obi-wallet/headless-ui-store";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { action, autorun, observable, runInAction, toJS } from "mobx";
import { z } from "zod";

export const SingleKeyMetaData = z.object({
  name: z.string().optional(),
  timestamp: z.string().datetime({ offset: true }).optional(),
  payload: z.unknown().optional(),
});

export type SingleKeyMetaData = z.TypeOf<typeof SingleKeyMetaData>;

export const KeyMetaData = z.record(SingleKeyMetaData);

export type KeyMetaData = z.TypeOf<typeof KeyMetaData>;

export const PhoneSingleKeyMetaData = z.intersection(
  SingleKeyMetaData,
  z.object({
    payload: z.object({
      phoneNumber: z.string(),
      securityQuestion: z.string(),
    }),
  }),
);

export type PhoneSingleKeyMetaData = z.TypeOf<typeof PhoneSingleKeyMetaData>;

export const TelegramSingleKeyMetaData = z.intersection(
  SingleKeyMetaData,
  z.object({
    payload: z.object({
      chatId: z.string(),
      securityQuestion: z.string(),
    }),
  }),
);

export type TelegramSingleKeyMetaData = z.TypeOf<
  typeof TelegramSingleKeyMetaData
>;

export const KeyMetaDataPerWallet = z.record(KeyMetaData);

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

  public getKeyMetaData(id: string): KeyMetaData {
    return this.keyMetaDataPerWallet[id] ?? {};
  }

  public getSingleKeyMetaData(
    id: string,
    publicKey: Secp256k1PublicKey,
  ): SingleKeyMetaData {
    return this.getKeyMetaData(id)[publicKey.value] ?? {};
  }

  @action
  public setKeyMetaData(id: string, keyMetaData: KeyMetaData) {
    this.keyMetaDataPerWallet[id] = keyMetaData;
  }

  @action
  public setSingleKeyMetaData(
    id: string,
    publicKey: Secp256k1PublicKey,
    singleKeyMetaData: SingleKeyMetaData,
  ) {
    this.setKeyMetaData(id, {
      ...this.getKeyMetaData(id),
      [publicKey.value]: {
        ...singleKeyMetaData,
        name: singleKeyMetaData.name ? singleKeyMetaData.name : undefined,
        timestamp: singleKeyMetaData.timestamp
          ? singleKeyMetaData.timestamp
          : undefined,
      },
    });
  }

  public async getFromKVStore(): Promise<KeyMetaDataPerWallet> {
    const data = await this.kvStore.get("key-meta-data");
    const result = KeyMetaDataPerWallet.safeParse(data);
    if (!result.success) return {};
    return result.data;
  }
}
