import { Bech32Address } from "@keplr-wallet/cosmos";
import * as R from "ramda";

import { MultisigWalletSchema } from "./schema";
import {
  Chain,
  ChainId,
  CosmosChain,
  cosmosChains,
  TerraChain,
  terraChains,
} from "../../chains";
import {
  AbstractMultisigWalletSdk,
  BroadcastTransactionResult,
  MultisigWalletSdk,
  Sdk,
  Token,
} from "../../sdk";
import { Secp256k1PrivateKeySigner } from "../../signers";
import { Message, wrapMessages } from "../../transactions";
import { FlexAccount } from "../flex-account";
import { GatekeeperConfig } from "../gatekeeper-config";
import { AbstractSerialized } from "../migratable";
import { MultisigKey } from "../multisig-key";
import { SinglesigWallet } from "../singlesig-wallet";

export type CurrentAccountMeta = {
  type: "flex-account" | "singlesig-wallet";
  id: string;
};

export interface WalletMeta {
  walletId: string;
  currentAccount: CurrentAccountMeta | null;
}

export class MultisigWallet {
  protected multisigWalletSdk: AbstractMultisigWalletSdk;

  public get schema() {
    return MultisigWalletSchema;
  }

  public constructor(
    protected _chainId: ChainId,
    protected _owner: MultisigKey,
    protected _proxyAddress: string,
    protected _gatekeeperConfig: GatekeeperConfig,
    protected _singlesigWallets: SinglesigWallet[],
    protected _currentAccount: CurrentAccountMeta | null,
    protected _isDemo: boolean
  ) {
    this.multisigWalletSdk = MultisigWalletSdk.wallet(this);
  }

  public toJSON(): AbstractSerialized<typeof MultisigWalletSchema> {
    return {
      type: this._isDemo ? "multisig-demo" : "multisig",
      data: {
        chain: this._chainId,
        owner: this._owner.toJSON(),
        proxyAddress: {
          v: 1,
          address: this._proxyAddress,
        },
        gatekeeperConfig: this._gatekeeperConfig.toJSON(),
        singlesigWallets: this._singlesigWallets.map((s) => s.toJSON()),
        currentAccount: this._currentAccount,
      },
    };
  }

  public get id() {
    return this.proxyAddress;
  }

  public get meta(): WalletMeta {
    return {
      walletId: this.id,
      currentAccount: this._currentAccount,
    };
  }

  public get chainId() {
    return this._chainId;
  }

  public get chain() {
    // TODO: move into SDK or a new Chain DS
    return Chain.select<
      (typeof terraChains)[TerraChain] | (typeof cosmosChains)[CosmosChain]
    >({
      chainId: this._chainId,
      onTerraChain(chainId) {
        return terraChains[chainId];
      },
      onCosmosChain(chainId) {
        return cosmosChains[chainId];
      },
    });
  }

  public get isDemo() {
    return this._isDemo;
  }

  public get proxyAddress() {
    return this._proxyAddress;
  }

  public get address() {
    return this.getAddressByAccountMeta(this._currentAccount);
  }

  public getAddressByAccountMeta(
    currentAccountMeta: CurrentAccountMeta | null
  ) {
    const currentAccount = currentAccountMeta
      ? this.getAccountByMeta(currentAccountMeta)
      : null;
    if (currentAccount?.type === "singlesig-wallet") {
      return Sdk.chainId(this._chainId).transactions.getAddressOfPublicKey(
        currentAccount.publicKey
      );
    }

    return this._proxyAddress;
  }

  public get shortenedAddress(): string | null {
    const address = this.address;
    return address ? Bech32Address.shortenAddress(address, 20) : null;
  }

  public async isOutdated() {
    return await this.multisigWalletSdk.isOutdated();
  }

  public async update() {
    return await this.multisigWalletSdk.updateWallet();
  }

  public async updateOwner(newOwner: MultisigKey) {
    const response = await this.multisigWalletSdk.updateOwner(newOwner);
    if (response.approved && response.payload.success) {
      this.setOwner(newOwner);
    }
    return response;
  }

  public get currentAccount() {
    if (!this._currentAccount) return null;
    return this.getAccountByMeta(this._currentAccount);
  }

  public getAccountByMeta(account: CurrentAccountMeta) {
    switch (account.type) {
      case "flex-account":
        return (
          this._gatekeeperConfig.flexAccounts.find((f) => {
            return f.address === account.id;
          }) ?? null
        );
      case "singlesig-wallet":
        return (
          this.singlesigWallets.find((s) => {
            return s.publicKey.value === account.id;
          }) ?? null
        );
    }
  }

  public setCurrentAccountByMeta(account: CurrentAccountMeta | null) {
    this._currentAccount = account;
  }

  public get owner() {
    return this._owner;
  }

  public setOwner(owner: MultisigKey) {
    this._owner = owner;
  }

  public get gatekeeperConfig() {
    return this._gatekeeperConfig;
  }

  public setGatekeeperConfig(gatekeeperConfig: GatekeeperConfig) {
    this._gatekeeperConfig = gatekeeperConfig;
  }

  public async updateGatekeeperConfig(newGatekeeperConfig: GatekeeperConfig) {
    const response = await this.multisigWalletSdk.updateGatekeeperConfig(
      newGatekeeperConfig
    );
    if (response.approved && response.payload.success) {
      this.setGatekeeperConfig(newGatekeeperConfig);
    }
    return response;
  }

  public get singlesigWallets() {
    return this._singlesigWallets;
  }

  public upsertSinglesigWallet(singlesig: SinglesigWallet) {
    const index = this._singlesigWallets.findIndex(
      (s) => s.publicKey === singlesig.publicKey
    );
    if (index === -1) {
      this._singlesigWallets.push(singlesig);
    } else {
      this._singlesigWallets[index] = singlesig;
    }
  }

  public removeSinglesigWallet(singlesig: SinglesigWallet) {
    this._singlesigWallets = this._singlesigWallets.filter(
      (s) => s.publicKey !== singlesig.publicKey
    );
  }

  public async canExecute({
    flexAccount,
    messages,
  }: {
    flexAccount: FlexAccount;
    messages: Message[];
  }) {
    return await this.multisigWalletSdk.canExecute({
      flexAccount,
      messages,
    });
  }

  public async signAndBroadcastTransaction({
    flexAccount,
    messages,
  }: {
    flexAccount: FlexAccount;
    messages: Message[];
  }): Promise<BroadcastTransactionResult>;
  public async signAndBroadcastTransaction({
    singlesigWallet,
    messages,
  }: {
    singlesigWallet: SinglesigWallet;
    messages: Message[];
  }): Promise<BroadcastTransactionResult>;
  public async signAndBroadcastTransaction(
    payload: (
      | {
          flexAccount: FlexAccount;
        }
      | {
          singlesigWallet: SinglesigWallet;
        }
    ) & { messages: Message[] }
  ): Promise<BroadcastTransactionResult> {
    if (R.has("flexAccount", payload)) {
      const { flexAccount, messages } = payload;
      const signer = new Secp256k1PrivateKeySigner(flexAccount.privateKey);
      await this.sdk.transactions.prepareKeyPair({
        publicKey: flexAccount.publicKey,
        privateKey: flexAccount.privateKey,
      });
      const wrappedMessages = wrapMessages({
        messages,
        contract: this.proxyAddress,
        sender: flexAccount.address,
      });
      const signedTransaction =
        await this.multisigWalletSdk.createAndSignTransaction({
          signer,
          messages: wrappedMessages,
        });
      return await this.sdk.transactions.broadcastSignedTransactionAndLendFees({
        signedTransaction,
        sender: flexAccount.address,
      });
    } else {
      const { singlesigWallet, messages } = payload;
      const signer = new Secp256k1PrivateKeySigner(singlesigWallet.privateKey);
      const signedTransaction =
        await this.multisigWalletSdk.createAndSignTransaction({
          signer,
          messages,
        });
      return await this.multisigWalletSdk.broadcastSignedTransaction(
        signedTransaction
      );
    }
  }

  public async stake({
    amount,
    validator,
  }: {
    amount: Token;
    validator: string;
  }) {
    return await this.multisigWalletSdk.stake({
      amount,
      validator,
    });
  }

  public async unstake({
    amount,
    validator,
  }: {
    amount: Token;
    validator: string;
  }) {
    return await this.multisigWalletSdk.unstake({
      amount,
      validator,
    });
  }

  public async withdrawRewards() {
    return await this.multisigWalletSdk.withdrawRewards();
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }
}
