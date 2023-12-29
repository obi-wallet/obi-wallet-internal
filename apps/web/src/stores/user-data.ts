import { AbstractKVStore } from "@obi-wallet/headless-ui";
import { action, computed, makeObservable, runInAction } from "mobx";

interface UserData {
  userName: string;
  userAvatar: string | null;
}

export class UserDataStore {
  protected userName: string | null;
  protected userAvatar: string | null;
  protected readonly kvStore: AbstractKVStore;

  constructor(KVStore: AbstractKVStore) {
    this.kvStore = KVStore;

    this.userName = null;
    this.userAvatar = null;

    makeObservable(this, {
      userData: computed,
      setUserData: action,
    });
    this.init();
  }
  public get userData(): UserData {
    return {
      userName: this.userName ?? "",
      userAvatar: this.userAvatar,
    };
  }

  protected async init() {
    const currentUserData = await this.getFromKVStore();

    runInAction(() => {
      this.userName = currentUserData?.userName ?? null;
      this.userAvatar = currentUserData?.userAvatar ?? null;
    });
  }

  public setUserData(userData: UserData) {
    this.userName = userData.userName;
    this.userAvatar = userData.userAvatar;
    this.save();
  }
  protected async save() {
    const userData = {
      userName: this.userName,
      userAvatar: this.userAvatar,
    };
    await this.kvStore.set("userData", userData);
  }
  public async getFromKVStore() {
    return await this.kvStore.get<UserData | undefined>("userData");
  }
}
