import {
  MpcWallets,
  MpcWalletsSchema,
  ObservableMpcWallets,
} from "@obi-wallet/sdk";
import { autorun, observable, runInAction, toJS } from "mobx";
import { z } from "zod";

import { AbstractStorage } from "../storage";

export enum WalletState {
  /** We are still loading the data from the KV stores. */
  LOADING = "LOADING",
  /** The data in the KV store was invalid. */
  INVALID = "INVALID",
  /** We successfully loaded the data from the KV stores. */
  READY = "READY",
}

export type WalletsStorage = AbstractStorage<z.infer<typeof MpcWalletsSchema>>;

export class WalletsStore {
  protected readonly storage: WalletsStorage;

  @observable public accessor state: WalletState = WalletState.LOADING;
  public initPromise: Promise<void>;
  @observable public accessor mpcWallets: MpcWallets;

  constructor({ storage }: { storage: WalletsStorage }) {
    this.storage = storage;
    this.mpcWallets = ObservableMpcWallets.create();
    this.initPromise = this.init();
  }

  protected async init() {
    try {
      const data = await this.storage.get();

      runInAction(() => {
        if (data) {
          this.mpcWallets.deserialize(data);
        }
        this.state = WalletState.READY;
      });

      autorun(async () => {
        const data = MpcWallets.schema.parse(toJS(this.mpcWallets.toJSON()));
        // TODO: temporarily disable saving during refactoring
        console.log(data);
        return;
        await this.storage.set(data);
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const error = e as Error;
      runInAction(() => {
        this.state = WalletState.INVALID;
      });
      console.error(error.message);
    }
  }
}
