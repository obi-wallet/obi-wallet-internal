import {
  isSecretJsChain,
  KeyType,
  Sdk,
  Secp256k1KeyPair,
  Secp256k1PublicKey,
  secretJsChains,
  SecretJsClient,
  ZAuthKeySigner,
} from "@obi-wallet/sdk";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { MsgExecuteContract } from "secretjs";
import invariant from "tiny-invariant";

import { AbstractKVStore } from "../../kv-store";
import { WalletsStore } from "../wallets";

export interface EthereumAccount {
  publicKey: Secp256k1PublicKey;
  address: string;
}

export interface EthereumAccountWithPrivateKey {
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
      | "sdk"
      | "client"
      | "chain"
      | "zAuthKey"
      | "wallet"
    >(this, {
      fetchEthereumAccountFromChain: true,
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
    return (
      this.ethereumAccount ??
      (await this.fetchEthereumAccountFromChain()) ??
      (await this.createEthereumAccount())
    );
  }

  public async fetchEthereumAccountFromChain(): Promise<EthereumAccount | null> {
    return await this.client.withSecretNetworkClient(async (client) => {
      const zAuthKey = this.zAuthKey;
      invariant(zAuthKey, "No ZAuth key");

      try {
        const response = await client.query.compute.queryContract({
          contract_address: this.chain.secretSigner.address,
          code_hash: this.chain.secretSigner.codeHash,
          query: {
            eth_pubkey: {
              user_public_key: Buffer.from(
                zAuthKey.publicKey.value,
                "base64",
              ).toString("hex"),
            },
          },
        });
        console.log(response);
      } catch (e) {
        console.log(e);
      }
      return null;
    });
  }

  public async createEthereumAccount(): Promise<EthereumAccount> {
    const address = this.wallet.proxyAddress;
    const account = await this.generateEthereumAccount();
    runInAction(() => {
      this.accounts[address] = account;
    });
    return account;
  }

  protected async generateEthereumAccount(): Promise<EthereumAccount> {
    const response = await fetch("/api/ethereum-demo/create-account", {
      method: "POST",
      body: JSON.stringify({
        publicKey: this.zAuthKey.publicKey,
        chainId: this.chain.chainId,
      }),
    });
    const { keyPair, address } = (await response.json()) as {
      keyPair: {
        publicKey: Secp256k1PublicKey;
        privateKey?: string;
      };
      address: string;
    };

    if (keyPair.privateKey) {
      const zAuthKeyAddress = this.sdk.transactions.getAddressOfPublicKey(
        this.zAuthKey.publicKey,
      );

      const hash = await this.client.withSecretNetworkClient(async (client) => {
        const contract = await client.query.compute.contractInfo({
          contract_address: this.wallet.proxyAddress,
        });
        return client.query.compute.codeHashByCodeId({
          code_id: contract.ContractInfo?.code_id,
        });
      });
      const signedTransaction = await this.client.createAndSignTransaction({
        signer: new ZAuthKeySigner(this.zAuthKey),
        messages: [
          new MsgExecuteContract({
            sender: zAuthKeyAddress,
            contract_address: this.chain.secretSigner.address,
            msg: {
              add_key: {
                public_key: Buffer.from(
                  this.zAuthKey.publicKey.value,
                  "base64",
                ).toString("hex"),
                user_entry_address: this.wallet.proxyAddress,
                user_entry_code_hash: hash.code_hash,
                inject_privkey: Buffer.from(
                  keyPair.privateKey,
                  "base64",
                ).toString("hex"),
              },
            },
            code_hash: this.chain.secretSigner.codeHash,
          }),
        ],
      });
      const broadcastTransactionResult =
        await this.client.broadcastSignedTransaction(signedTransaction);
      console.log(broadcastTransactionResult);
    }

    return {
      publicKey: keyPair.publicKey,
      address,
    };
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
