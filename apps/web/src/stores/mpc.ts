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
import { autorun } from "mobx";

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
  protected readonly kvStore: AbstractKVStore;
  protected _sharesPromise: Promise<UnclaimedShares> | undefined;
  protected webWorker;

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
    this.kvStore = kvStore;
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
    this._sharesPromise = this.createShares();
    return this._sharesPromise;
  }

  protected async createShares(): Promise<UnclaimedShares> {
    const shares = await this.getUnclaimedShares();

    if (shares) return shares;

    const unclaimedShares = await new Promise<UnclaimedShares>((resolve) => {
      this.webWorker.onmessage = (event: MessageEvent<UnclaimedShares>) => {
        resolve(event.data);
      };
      this.webWorker.postMessage(null);
    });
    await this.setUnclaimedShares(unclaimedShares);
    return unclaimedShares;
  }

  protected async getUnclaimedShares(): Promise<UnclaimedShares | undefined> {
    return await this.kvStore.get<UnclaimedShares>(unclaimedSharesKvStoreEntry);
  }

  protected async setUnclaimedShares(shares: UnclaimedShares) {
    await this.kvStore.set(unclaimedSharesKvStoreEntry, shares);
  }

  protected async clearUnclaimedShares() {
    await this.kvStore.set(unclaimedSharesKvStoreEntry, null);
  }
}
