import { action, computed, makeObservable, observable } from "mobx";

import * as MultisigSerializedData from "./serialized-data";
import { cosmosChains, isTerraChain, terraChains } from "../../../chains";
import { AbstractWallet, WalletType } from "../abstract-wallet";
import { MultisigKey } from "../multisig-key";
import {
  SerializedMultisigDemoWallet,
  SerializedMultisigWallet,
} from "../serialized-data";

export { MultisigSerializedData };

export class MultisigWallet extends AbstractWallet {
  protected readonly _id: string;

  @observable
  protected serializedWallet:
    | SerializedMultisigWallet
    | SerializedMultisigDemoWallet;
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

  public get proxyAddress(): MultisigSerializedData.SerializedProxyAddress {
    return this.serializedWallet.data.proxyAddress;
  }

  @computed
  public get isDemo() {
    return this.serializedWallet.type === "multisig-demo";
  }

  @computed
  public get owner() {
    return MultisigKey.deserialize(this.serializedWallet.data.owner);
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
