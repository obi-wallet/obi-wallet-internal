import { Secp256k1KeyPair } from "@obi-wallet/sdk";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import invariant from "tiny-invariant";

import { AbstractKVStore } from "../../kv-store";
import { WalletsStore } from "../wallets";

export interface EthereumAccount {
  keyPair: Secp256k1KeyPair;
  address: string;
}

type Accounts = Record<string, EthereumAccount>;

export class EthereumDemoStore {
  protected readonly kvStore: AbstractKVStore;
  protected readonly walletsStore: WalletsStore;

  protected accounts: Accounts = {};

  public initPromise: Promise<void>;

  constructor({
    kvStore,
    walletsStore,
  }: {
    kvStore: AbstractKVStore;
    walletsStore: WalletsStore;
  }) {
    this.kvStore = kvStore;
    this.walletsStore = walletsStore;
    makeObservable<
      EthereumDemoStore,
      | "init"
      | "kvStore"
      | "walletsStore"
      | "accounts"
      | "generateEthereumAccount"
      | "generateEthereumAddress"
    >(this, {
      kvStore: false,
      walletsStore: false,
      accounts: observable,
      initPromise: false,
      init: false,
      ethereumAccount: false,
      getEthereumAccount: false,
      createEthereumAccount: false,
      generateEthereumAccount: false,
      generateEthereumAddress: false,
    });
    this.initPromise = this.init();
  }

  protected async init() {
    const data = await this.kvStore.get<Accounts>("accounts");

    await new Promise<void>((resolve) => {
      runInAction(() => {
        if (data) {
          this.accounts = data;
        }
        resolve();
      });
    });

    autorun(async () => {
      await this.kvStore.set("accounts", toJS(this.accounts));
    });
  }

  public get ethereumAccount(): EthereumAccount | null {
    const address = this.walletsStore.wallets.currentWallet?.proxyAddress;
    return (address ? this.accounts[address] : null) ?? null;
  }

  public async getEthereumAccount(): Promise<EthereumAccount> {
    await this.initPromise;
    return this.ethereumAccount ?? (await this.createEthereumAccount());
  }

  public async createEthereumAccount(): Promise<EthereumAccount> {
    const address = this.walletsStore.wallets.currentWallet?.proxyAddress;
    invariant(address, "No current wallet");
    const account = await this.generateEthereumAccount();
    runInAction(() => {
      this.accounts[address] = account;
    });
    return account;
  }

  protected async generateEthereumAccount(): Promise<EthereumAccount> {
    const response = await fetch("/api/ethereum-demo/create-account", {
      method: "POST",
    });
    return await response.json();
  }
}
