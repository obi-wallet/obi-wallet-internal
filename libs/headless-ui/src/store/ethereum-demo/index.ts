import {
  isSecretJsChain,
  KeyType,
  Sdk,
  Secp256k1PublicKey,
  secretJsChains,
  SecretJsClient,
} from "@obi-wallet/sdk";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import invariant from "tiny-invariant";

import { AbstractKVStore } from "../../kv-store";
import { WalletsStore } from "../wallets";

export interface EthereumAccount {
  publicKey: Secp256k1PublicKey;
  evmSignerAddress: string;
  evmUserContractAddress: string;
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
      | "sdk"
      | "client"
      | "chain"
      | "zAuthKey"
      | "wallet"
    >(this, {
      sdk: false,
      client: false,
      chain: false,
      zAuthKey: false,
      wallet: false,
      kvStore: false,
      walletsStore: false,
      accounts: observable,
      initPromise: false,
      init: false,
      ethereumAccount: false,
      getEthereumAccount: false,
      setEthereumAccount: action,
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
    invariant(this.ethereumAccount, "No Ethereum account");
    return this.ethereumAccount;
  }

  public setEthereumAccount(address: string, account: EthereumAccount) {
    this.accounts[address] = account;
  }

  protected get sdk() {
    return Sdk.chainId(this.chain.chainId);
  }

  protected get client(): SecretJsClient {
    return new SecretJsClient(this.chain.chainId);
  }

  protected get chain() {
    const chainId = this.wallet.chainId;
    invariant(isSecretJsChain(chainId), "Not a SecretJS chain");

    return secretJsChains[chainId];
  }

  protected get zAuthKey() {
    const zAuthKey = this.wallet.owner.getUsableKeyOfType(KeyType.ZAuth);
    invariant(zAuthKey, "No ZAuth key");

    return zAuthKey;
  }

  protected get wallet() {
    const wallet = this.walletsStore.wallets.currentWallet;
    invariant(wallet, "No current wallet");

    return wallet;
  }
}
