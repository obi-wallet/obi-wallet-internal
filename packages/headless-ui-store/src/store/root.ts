import { ObservableUserInteractions, UserInteractions } from "@obi-wallet/sdk";

import { WalletsStorage, WalletsStore } from "./wallets";

export class RootStore {
  protected readonly _walletsStore: WalletsStore;

  public readonly userInteractionsStore: UserInteractions;

  public constructor({ walletsStorage }: { walletsStorage: WalletsStorage }) {
    this.userInteractionsStore = ObservableUserInteractions.create();
    this._walletsStore = new WalletsStore({
      storage: walletsStorage,
    });
  }

  public get walletsStoreState() {
    return this._walletsStore.state;
  }

  public get mpcWalletsStore() {
    return this._walletsStore.mpcWallets;
  }
}
