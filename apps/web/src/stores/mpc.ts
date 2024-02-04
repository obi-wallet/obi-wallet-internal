import { WasmStore } from "@/stores/wasm";
import { AbstractKVStore } from "@obi-wallet/headless-ui";
import { Parameters as KeygenParam } from "@obi-wallet/mpc-ecdsa-wasm-types";
import { BackupShare, EasyShare, NetworkShare, Wallets } from "@obi-wallet/sdk";
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
  protected readonly walletsStore: Wallets;
  protected readonly wasmStore: WasmStore;
  protected readonly unclaimedSharesKVStore: AbstractKVStore;
  protected _sharesPromise: Promise<UnclaimedShares> | undefined;
  protected webWorker;

  constructor({
    kvStore,
    walletsStore,
    wasmStore,
  }: {
    kvStore: AbstractKVStore;
    walletsStore: Wallets;
    wasmStore: WasmStore;
  }) {
    this.unclaimedSharesKVStore = kvStore;
    this.walletsStore = walletsStore;
    this.wasmStore = wasmStore;

    this.webWorker = new Worker(new URL("../workers/mpc", import.meta.url));

    autorun(() => {
      if (!this.walletsStore.currentWallet) {
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
    const data = await this.unclaimedSharesKVStore.get<unknown>(
      unclaimedSharesKvStoreEntry,
    );
    if (!data) return undefined;
    return data as UnclaimedShares;
  }

  protected async setUnclaimedShares(shares: UnclaimedShares) {
    await this.unclaimedSharesKVStore.set(unclaimedSharesKvStoreEntry, shares);
  }

  protected async clearUnclaimedShares() {
    await this.unclaimedSharesKVStore.set(unclaimedSharesKvStoreEntry, null);
  }
}
