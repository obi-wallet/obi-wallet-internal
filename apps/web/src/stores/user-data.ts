import { AbstractKVStore } from "@obi-wallet/headless-ui";
import { action, autorun, observable, runInAction, toJS } from "mobx";
import { z } from "zod";

const userDataSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(),
  balanceHidden: z.boolean().optional(),
});

export type UserData = z.TypeOf<typeof userDataSchema>;

const userDataPerWalletSchema = z.record(userDataSchema);

type UserDataPerWallet = z.infer<typeof userDataPerWalletSchema>;

export class UserDataStore {
  @observable protected accessor userDataPerWallet: UserDataPerWallet = {};
  protected readonly kvStore: AbstractKVStore;

  public constructor(KVStore: AbstractKVStore) {
    this.kvStore = KVStore;
    void this.init();
  }

  protected async init() {
    const currentUserData = await this.getFromKVStore();

    runInAction(() => {
      this.userDataPerWallet = currentUserData;
    });

    autorun(async () => {
      const data = userDataPerWalletSchema.parse(toJS(this.userDataPerWallet));
      await this.kvStore.set("user-data", data);
    });
  }

  public getUserData(address: string): UserData {
    return this.userDataPerWallet[address] ?? {};
  }

  @action
  public setUserData(address: string, userData: UserData) {
    this.userDataPerWallet[address] = userData;
  }

  public async getFromKVStore(): Promise<UserDataPerWallet> {
    const data = await this.kvStore.get("user-data");
    const result = userDataPerWalletSchema.safeParse(data);
    if (!result.success) return {};
    return result.data;
  }
}
