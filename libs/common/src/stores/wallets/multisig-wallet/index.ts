import { action, computed, makeObservable, observable } from "mobx";

import * as MultisigWalletSerializedData from "./serialized-data";
import {
  SerializedMultisigDemoWallet,
  SerializedMultisigWallet,
  SerializedMultisigWalletData,
  SerializedProxyAddress,
  SinglesigWallet,
} from "./serialized-data";
import {
  Chain,
  cosmosChains,
  isTerraChain,
  terraChains,
} from "../../../chains";
import { terra } from "../../../networks";
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
  protected _currentAccount: {
    type: "flex-account" | "singlesig-wallet";
    id: EntityId;
  } | null = null;

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

  @computed
  public get address(): string {
    if (this.currentAccount?.type === "singlesig-wallet") {
      return terra.getAddress({
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

  @computed
  public get isOutdated(): boolean {
    const codeId = this.proxyAddress.codeId ?? null;
    const currentCodeId = isTerraChain(this.chain)
      ? terraChains[this.chain].currentCodeIds.userAccount
      : cosmosChains[this.chain].currentCodeId;
    return codeId !== null && codeId < currentCodeId;
  }

  public getAccounts(gatekeeperConfig = this._gatekeeperConfig) {
    return Entities.merge<Beneficiary | FlexAccount | SinglesigWallet>(
      gatekeeperConfig.beneficiaries,
      gatekeeperConfig.flexAccounts,
      this._singlesigWallets
    );
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

  @action async setProxyCodeId(codeId: number) {
    this.proxyAddress.codeId = codeId;
    await this.save();
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
        currentAccount: (() => {
          if (!this._currentAccount) return null;
          switch (this._currentAccount.type) {
            case "flex-account":
              return {
                type: "flex-account",
                index: this._gatekeeperConfig.flexAccounts.ids.indexOf(
                  this._currentAccount.id
                ),
              };
            case "singlesig-wallet":
              return {
                type: "singlesig-wallet",
                index: this._singlesigWallets.ids.indexOf(
                  this._currentAccount.id
                ),
              };
          }
        })(),
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
    wallet._currentAccount = (() => {
      if (!serializedWallet.data.currentAccount) return null;
      switch (serializedWallet.data.currentAccount.type) {
        case "flex-account":
          return {
            type: "flex-account",
            id: wallet.gatekeeperConfig.flexAccounts.ids[
              serializedWallet.data.currentAccount.index
            ],
          };
        case "singlesig-wallet":
          return {
            type: "singlesig-wallet",
            id: wallet.singlesigWallets.ids[
              serializedWallet.data.currentAccount.index
            ],
          };
      }
    })();
    return wallet;
  }

  protected async save() {
    await this.onChange();
  }
}
