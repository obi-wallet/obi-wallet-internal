import { AbstractKVStore } from "@obi-wallet/headless-ui";
import { action, computed, observable, runInAction } from "mobx";

interface UserData {
  userName: string;
  userAvatar: string | null;
}

export class UserDataStore {
  @observable protected accessor userName: string | null;
  @observable protected accessor userAvatar: string | null;
  protected readonly kvStore: AbstractKVStore;

  constructor(KVStore: AbstractKVStore) {
    this.kvStore = KVStore;

    this.userName = null;
    this.userAvatar = null;

    void this.init();
  }

  @computed
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

  @action
  public setUserData(userData: UserData) {
    this.userName = userData.userName;
    this.userAvatar = userData.userAvatar;
    void this.save();
  }

  protected async save() {
    const userData = {
      userName: this.userName,
      userAvatar: this.userAvatar,
    };
    await this.kvStore.set("userData", userData);
  }

  public async getFromKVStore() {
    return await this.kvStore.get<UserData>("userData");
  }
}
