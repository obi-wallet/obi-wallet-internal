import { makeObservable, observable } from "mobx";

import { AbstractWallet, WalletType } from "../../wallets/abstract-wallet";
import { SerializedTerraMultisigWallet } from "../serialized-data";

export class TerraMultisigWallet extends AbstractWallet {
  protected readonly _id: string;

  @observable
  protected serializedWallet: SerializedTerraMultisigWallet;
  protected onChange: (
    serializedWallet: SerializedTerraMultisigWallet
  ) => Promise<void>;

  constructor({
    id,
    serializedWallet,
    onChange,
  }: {
    id: string;
    serializedWallet: SerializedTerraMultisigWallet;
    onChange: (
      serializedWallet: SerializedTerraMultisigWallet
    ) => Promise<void>;
  }) {
    super();
    this._id = id;
    this.serializedWallet = serializedWallet;
    this.onChange = onChange;
    makeObservable(this);
  }

  get address(): string | null {
    return this.serializedWallet.data.proxyAddress?.address ?? null;
  }

  public get id() {
    return this._id;
  }

  get isReady(): boolean {
    return false;
  }

  // TODO:
  get type(): WalletType {
    return WalletType.Multisig;
  }
}
