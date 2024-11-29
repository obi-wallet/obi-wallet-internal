import { WasmStore } from "@/stores/wasm";
import {
  AbstractKVStore,
  RootStore,
  WalletState,
} from "@obi-wallet/headless-ui-store";
import { Parameters as KeygenParam } from "@obi-wallet/mpc-ecdsa-wasm-types";
import {
  BackupShare,
  EasyShare,
  NetworkShare,
  MpcWallets,
} from "@obi-wallet/sdk";
import { autorun, observable, runInAction } from "mobx";

export interface DistributeSharesResponse {
  keygenParam: KeygenParam;
  backupParticipants: number[];
  networkParticipants: number[];
  easyShare: EasyShare;
  backupShare: BackupShare;
  networkShare: NetworkShare;
}

export type UnclaimedShares = DistributeSharesResponse;

const unclaimedSharesKvStoreEntry = "shares";

export class MpcStore {
  protected readonly walletsStore: MpcWallets;
  protected readonly wasmStore: WasmStore;
  protected readonly unclaimedSharesKVStore: AbstractKVStore;
  protected _sharesPromise: Promise<UnclaimedShares> | undefined;
  protected webWorker;
  @observable public accessor isGeneratingShares = false;
  @observable public accessor hasUnclaimedShares = false;

  constructor({
    kvStore,
    walletsStore,
    sdkRootStore,
    wasmStore,
  }: {
    kvStore: AbstractKVStore;
    walletsStore: MpcWallets;
    sdkRootStore: RootStore;
    wasmStore: WasmStore;
  }) {
    this.unclaimedSharesKVStore = kvStore;
    this.walletsStore = walletsStore;
    this.wasmStore = wasmStore;

    this.webWorker = new Worker(new URL("../workers/mpc", import.meta.url));

    autorun(() => {
      if (
        sdkRootStore.walletsStoreState === WalletState.READY &&
        !sdkRootStore.mpcWalletsStore.currentWallet
      ) {
        void new Promise(() => {
          void this.createSharesSingleton();
        });
      }
    });
  }

  public async getShares() {
    const shares = await this.createSharesSingleton();
    this._sharesPromise = undefined;
    await this.clearUnclaimedShares();
    return shares;
  }

  protected createSharesSingleton(): Promise<UnclaimedShares> {
    if (this._sharesPromise) return this._sharesPromise;
    console.log("creating shares singleton");
    this._sharesPromise = this.createShares();
    return this._sharesPromise;
  }

  protected async createShares(): Promise<UnclaimedShares> {
    console.log("creating shares");

    const shares = await this.getUnclaimedShares();
    console.log("got shares", shares);

    if (shares) return shares;

    runInAction(() => {
      this.isGeneratingShares = true;
    });

    const unclaimedShares = await new Promise<UnclaimedShares>((resolve) => {
      console.log("setting up listener", this.webWorker);
      this.webWorker.onmessage = (event: MessageEvent<UnclaimedShares>) => {
        resolve(event.data);
      };
      this.webWorker.postMessage(null);
      console.log("waiting on response");
    });
    await this.setUnclaimedShares(unclaimedShares);

    runInAction(() => {
      this.hasUnclaimedShares = true;
      this.isGeneratingShares = false;
    });

    return unclaimedShares;
  }

  protected async getUnclaimedShares(): Promise<UnclaimedShares | undefined> {
    return await this.unclaimedSharesKVStore.get<UnclaimedShares>(
      unclaimedSharesKvStoreEntry,
    );
  }

  protected async setUnclaimedShares(shares: UnclaimedShares) {
    await this.unclaimedSharesKVStore.set(unclaimedSharesKvStoreEntry, shares);
  }

  protected async clearUnclaimedShares() {
    await this.unclaimedSharesKVStore.set(unclaimedSharesKvStoreEntry, null);
    console.log("cleared unclaimed shares");
    console.log(await this.getUnclaimedShares());
    runInAction(() => {
      this.hasUnclaimedShares = false;
    });
  }
}
