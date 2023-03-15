import {
  Chain,
  CosmosChain,
  cosmosChains,
  Sdk,
  TerraChain,
  terraChains,
} from "@obi-wallet/sdk";
import { action, computed, makeObservable, observable } from "mobx";

import * as MultisigWalletSerializedData from "./serialized-data";
import {
  SerializedMultisigDemoWallet,
  SerializedMultisigWallet,
  SerializedMultisigWalletData,
  SerializedProxyAddress,
  SinglesigWallet,
} from "./serialized-data";
import { SerializedWalletMeta, WalletMeta } from "..";
import { CodeIds, terra } from "../../../networks";
import { Entities, EntityId } from "../../entities";
import { AbstractWallet, WalletType } from "../abstract-wallet";
import { GatekeeperConfig } from "../gatekeeper-config";
import { Beneficiary, FlexAccount } from "../gatekeeper-config/serialized-data";
import { MultisigKey } from "../multisig-key";

export {
  Beneficiary,
  FlexAccount,
  SinglesigWallet,
  MultisigWalletSerializedData,
  SerializedMultisigWalletData,
};

export class MultisigWallet extends AbstractWallet {
  protected _id: string;

  @observable
  public readonly isDemo: boolean;

  @observable
  public readonly chain: Chain;

  @observable
  protected _owner: MultisigKey;

  @observable
  protected _gatekeeperConfig: GatekeeperConfig;

  @observable
  protected _singlesigWallets: Entities<SinglesigWallet>;

  @observable
  public readonly proxyAddress: SerializedProxyAddress;

  @observable
  protected _currentAccount: WalletMeta["currentAccount"] | null = null;

  protected onChange: () => Promise<void>;

  constructor({
    id,
    chain,
    isDemo,
    onChange,
    proxyAddress,
  }: {
    id: string;
    chain: Chain;
    isDemo: boolean;
    proxyAddress: SerializedProxyAddress;
    onChange: () => Promise<void>;
  }) {
    super();
    this._id = id;
    this.isDemo = isDemo;
    this.chain = chain;
    this._owner = new MultisigKey({ chain });
    this._gatekeeperConfig = new GatekeeperConfig();
    this._singlesigWallets = new Entities();
    this.proxyAddress = proxyAddress;
    this.onChange = onChange;
    makeObservable(this);
  }

  public get id() {
    return this._id;
  }

  public get chainInformation() {
    return Chain.select<
      (typeof terraChains)[TerraChain] | (typeof cosmosChains)[CosmosChain]
    >({
      chainId: this.chain,
      onTerraChain(chainId) {
        return terraChains[chainId];
      },
      onCosmosChain(chainId) {
        return cosmosChains[chainId];
      },
    });
  }

  @computed
  public get address(): string {
    if (this.currentAccount?.type === "singlesig-wallet") {
      return Sdk.chainId(this.chain).getAddressOfPublicKey({
        publicKey: this.currentAccount.publicKey,
      });
    }

    return this.proxyAddress.address;
  }

  public get type(): WalletType {
    return WalletType.Multisig;
  }

  public get isReady(): boolean {
    return true;
  }

  public isOutdated(codeIds: CodeIds): boolean {
    return Chain.select({
      chainId: this.chain,
      onTerraChain(chainId) {
        return (
          codeIds.userAccount <
            terraChains[chainId].currentCodeIds.userAccount ||
          codeIds.spendLimitGatekeeper === null ||
          codeIds.spendLimitGatekeeper <
            terraChains[chainId].currentCodeIds.spendLimitGatekeeper ||
          codeIds.debtGatekeeper === null ||
          codeIds.debtGatekeeper <
            terraChains[chainId].currentCodeIds.debtGatekeeper
        );
      },
      onCosmosChain(chainId) {
        return codeIds.userAccount < cosmosChains[chainId].currentCodeId;
      },
    });
  }

  public getAccounts(gatekeeperConfig = this._gatekeeperConfig) {
    return Entities.merge<Beneficiary | FlexAccount | SinglesigWallet>(
      gatekeeperConfig.beneficiaries,
      gatekeeperConfig.flexAccounts,
      this._singlesigWallets
    );
  }

  public get meta(): WalletMeta {
    return {
      walletId: this.id,
      currentAccount: this._currentAccount,
    };
  }

  public get currentAccountId() {
    return this._currentAccount?.id ?? null;
  }

  @computed
  public get currentAccount() {
    if (!this._currentAccount) return null;
    return this.getAccounts().get({ id: this._currentAccount.id });
  }

  @action
  public async setCurrentAccount(id: EntityId | null) {
    if (id && this.gatekeeperConfig.flexAccounts.ids.includes(id)) {
      this._currentAccount = {
        type: "flex-account",
        id,
      };
    } else if (id && this.singlesigWallets.ids.includes(id)) {
      this._currentAccount = {
        type: "singlesig-wallet",
        id,
      };
    } else {
      this._currentAccount = null;
    }
    await this.save();
  }

  public get owner() {
    return this._owner;
  }

  @action
  public async setOwner(owner: MultisigKey) {
    this._owner = owner;
    await this.save();
  }

  public get gatekeeperConfig() {
    return this._gatekeeperConfig;
  }

  @action
  public async setGatekeeperConfig(gatekeeperConfig: GatekeeperConfig) {
    this._gatekeeperConfig = gatekeeperConfig;
    await this.save();
  }

  public get singlesigWallets() {
    return this._singlesigWallets;
  }

  @action
  public async addSinglesigWallet(singlesig: SinglesigWallet) {
    this._singlesigWallets.add({
      entity: singlesig,
    });
    await this.save();
  }

  public serializeAccount(
    account: WalletMeta["currentAccount"]
  ): SerializedWalletMeta["currentAccount"] {
    if (!account) return null;
    switch (account.type) {
      case "flex-account":
        return {
          type: "flex-account" as const,
          index: this._gatekeeperConfig.flexAccounts.ids.indexOf(account.id),
        };
      case "singlesig-wallet":
        return {
          type: "singlesig-wallet" as const,
          index: this._singlesigWallets.ids.indexOf(account.id),
        };
    }
  }

  public deserializeAccount(
    account: SerializedWalletMeta["currentAccount"]
  ): WalletMeta["currentAccount"] {
    if (!account) return null;
    switch (account.type) {
      case "flex-account":
        return {
          type: "flex-account" as const,
          id: this._gatekeeperConfig.flexAccounts.ids[account.index],
        };
      case "singlesig-wallet":
        return {
          type: "singlesig-wallet" as const,
          id: this._singlesigWallets.ids[account.index],
        };
    }
  }

  public serialize(): SerializedMultisigWallet | SerializedMultisigDemoWallet {
    return {
      type: this.isDemo ? "multisig-demo" : "multisig",
      data: {
        chain: this.chain,
        owner: this._owner.serialize(),
        proxyAddress: this.proxyAddress,
        gatekeeperConfig: this._gatekeeperConfig.serialize(),
        singlesigWallets: this._singlesigWallets.serialize(),
        currentAccount: this.serializeAccount(this._currentAccount),
      },
    };
  }

  public static deserialize({
    id,
    serializedWallet,
    onChange,
  }: {
    id: string;
    serializedWallet: SerializedMultisigWallet | SerializedMultisigDemoWallet;
    onChange: () => Promise<void>;
  }): MultisigWallet {
    const wallet = new MultisigWallet({
      id,
      chain: serializedWallet.data.chain,
      isDemo: serializedWallet.type === "multisig-demo",
      proxyAddress: serializedWallet.data.proxyAddress,
      onChange,
    });
    wallet._owner = MultisigKey.deserialize({
      chain: serializedWallet.data.chain,
      serialized: serializedWallet.data.owner,
    });
    wallet._gatekeeperConfig = GatekeeperConfig.deserialize(
      serializedWallet.data.gatekeeperConfig
    );
    wallet._singlesigWallets = Entities.deserialize(
      serializedWallet.data.singlesigWallets
    );
    wallet._currentAccount = wallet.deserializeAccount(
      serializedWallet.data.currentAccount
    );
    return wallet;
  }

  protected async save() {
    await this.onChange();
  }
}
