import {
  AbstractSerialized,
  Beneficiary as BeneficiarySdk,
  FlexAccount as FlexAccountSdk,
  SinglesigWallet as SinglesigWalletSdk,
  ObservableMultisigWallet,
  Serialized,
} from "@obi-wallet/sdk";
import { makeObservable, observable } from "mobx";

import { WalletMeta } from "..";

export type Beneficiary = AbstractSerialized<typeof BeneficiarySdk>;
export type FlexAccount = AbstractSerialized<typeof FlexAccountSdk>;
export type SinglesigWallet = AbstractSerialized<typeof SinglesigWalletSdk>;

export class MultisigWallet extends ObservableMultisigWallet {
  protected _id: string;

  constructor(
    id: string,
    ...args: ConstructorParameters<typeof ObservableMultisigWallet>
  ) {
    super(...args);
    this._id = id;
    makeObservable<MultisigWallet, "_id">(this, {
      _id: observable,
      id: false,
      meta: false,
    });
  }

  public get id() {
    return this._id;
  }

  public get meta(): WalletMeta {
    return {
      walletId: this.id,
      currentAccount: this._currentAccount,
    };
  }

  public static deserializeWithId({
    id,
    serializedWallet,
  }: {
    id: string;
    serializedWallet: Serialized<typeof MultisigWallet>;
  }): MultisigWallet {
    return new MultisigWallet(
      id,
      ...this.deserializeConstructorParameters(serializedWallet)
    );
  }
}
