import {
  Chain,
  MultisigKey as MultisigKeySdk,
  Serialized,
} from "@obi-wallet/sdk";
import { action, makeObservable, observable } from "mobx";
import * as R from "ramda";

import { Draftable } from "../../drafts/draft";

// Chain-agnostic multisig key
export class MultisigKey implements Draftable {
  @observable.ref
  protected _multisigKey: MultisigKeySdk;

  public get() {
    return this._multisigKey;
  }

  @action
  public set(multisigKey: MultisigKeySdk) {
    this._multisigKey = multisigKey;
  }

  constructor({ chain }: { chain: Chain }) {
    this._multisigKey = MultisigKeySdk.empty(chain);
    makeObservable(this);
  }

  public toJSON() {
    return this._multisigKey.toJSON();
  }

  public clone() {
    return MultisigKey.deserialize({
      chain: this.get().chain,
      serialized: this.toJSON(),
    }) as this;
  }

  public equals(other: MultisigKey) {
    return R.equals(this._multisigKey.toJSON(), other._multisigKey.toJSON());
  }

  public static deserialize({
    chain,
    serialized,
  }: {
    chain: Chain;
    serialized: Serialized<typeof MultisigKeySdk>;
  }) {
    const multisigKey = new MultisigKey({ chain });
    multisigKey.set(MultisigKeySdk.deserialize(chain, serialized));
    return multisigKey;
  }
}
