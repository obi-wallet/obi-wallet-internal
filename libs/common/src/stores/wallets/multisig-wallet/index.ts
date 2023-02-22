import { action, computed, makeObservable, observable } from "mobx";

import * as MultisigWalletSerializedData from "./serialized-data";
import {
  SerializedMultisigDemoWallet,
  SerializedMultisigWallet,
  SinglesigWallet,
} from "./serialized-data";
import { cosmosChains, isTerraChain, terraChains } from "../../../chains";
import { Entities } from "../../entities";
import { AbstractWallet, WalletType } from "../abstract-wallet";
import { GatekeeperConfig } from "../gatekeeper-config";
import { Beneficiary, FlexAccount } from "../gatekeeper-config/serialized-data";
import { MultisigKey } from "../multisig-key";

export { MultisigWalletSerializedData };

export class MultisigWallet extends AbstractWallet {
  protected readonly _id: string;

  @observable
  protected serializedWallet:
    | SerializedMultisigWallet
    | SerializedMultisigDemoWallet;

  // TODO: move into MigratableSerializedMultisigWalletData as soon as the interface stabilizes
  @observable
  public gatekeeperConfig: GatekeeperConfig;

  @observable
  protected _singlesigAccounts: Entities<SinglesigWallet>;

  @observable
  public currentAccountId: string | null = null;

  protected onChange: (
    serializedWallet: SerializedMultisigWallet | SerializedMultisigDemoWallet
  ) => Promise<void>;

  constructor({
    id,
    serializedWallet,
    onChange,
  }: {
    id: string;
    serializedWallet: SerializedMultisigWallet | SerializedMultisigDemoWallet;
    onChange: (
      serializedWallet: SerializedMultisigWallet | SerializedMultisigDemoWallet
    ) => Promise<void>;
  }) {
    super();
    this._id = id;
    this.serializedWallet = serializedWallet;
    this.gatekeeperConfig = new GatekeeperConfig();
    this._singlesigAccounts = new Entities();
    this.onChange = onChange;
    makeObservable(this);
  }

  public get id() {
    return this._id;
  }

  @computed
  public get chain() {
    return this.serializedWallet.data.chain;
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
    const codeId = this.serializedWallet.data.proxyAddress.codeId ?? null;
    const currentCodeId = isTerraChain(this.chain)
      ? terraChains[this.chain].currentCodeId
      : cosmosChains[this.chain].currentCodeId;
    return codeId !== null && codeId < currentCodeId;
  }

  public get proxyAddress(): MultisigWalletSerializedData.SerializedProxyAddress {
    return this.serializedWallet.data.proxyAddress;
  }

  @computed
  public get isDemo() {
    return this.serializedWallet.type === "multisig-demo";
  }

  @computed
  public get owner() {
    return MultisigKey.deserialize({
      chain: this.chain,
      serialized: this.serializedWallet.data.owner,
    });
  }

  public getAccounts(gatekeeperConfig = this.gatekeeperConfig) {
    return Entities.merge<Beneficiary | FlexAccount | SinglesigWallet>(
      gatekeeperConfig.beneficiaries,
      gatekeeperConfig.flexAccounts,
      this._singlesigAccounts
    );
  }

  @action
  public addSinglesigAccount(singlesig: SinglesigWallet) {
    this._singlesigAccounts.add({
      entity: singlesig,
    });
  }

  @computed
  public get currentAccount() {
    if (!this.currentAccountId) return null;
    return this.getAccounts().get({ id: this.currentAccountId });
  }

  @action
  public async setCurrentAccount(id: string) {
    this.currentAccountId = id;
  }

  @computed
  public get currentAccountIndex() {
    if (!this.currentAccountId) return null;
    return this.getAccounts().ids.indexOf(this.currentAccountId);
  }

  @action
  public async setOwner(owner: MultisigKey) {
    this.serializedWallet.data.owner = owner.serialize();
    await this.onChange(this.serializedWallet);
  }

  @action async setProxyCodeId(codeId: number) {
    this.serializedWallet.data.proxyAddress.codeId = codeId;
    await this.onChange(this.serializedWallet);
  }
}
