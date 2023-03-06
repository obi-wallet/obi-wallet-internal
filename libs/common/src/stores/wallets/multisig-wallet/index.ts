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
import { Entities } from "../../entities";
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

  get address(): string {
    return this.proxyAddress.address;
  }

  get type(): WalletType {
    return WalletType.Multisig;
  }

  get isReady(): boolean {
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

  // TODO:
  // @computed
  // public get currentAccount() {
  //   if (!this.currentAccountId) return null;
  //   return this.getAccounts().get({ id: this.currentAccountId });
  // }
  //
  // @action
  // public async setCurrentAccount(id: string) {
  //   this.currentAccountId = id;
  // }
  //
  // @computed
  // public get currentAccountIndex() {
  //   if (!this.currentAccountId) return null;
  //   return this.getAccounts().ids.indexOf(this.currentAccountId);
  // }
  //

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
        gatekeeperConfig: this._gatekeeperConfig.serialize(),
        singlesigWallets: this._singlesigWallets.serialize(),
        proxyAddress: this.proxyAddress,
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
    return wallet;
  }

  protected async save() {
    console.log("saving", JSON.stringify(this.serialize(), null, 2));
    await this.onChange();
  }
}
