// Chain-agnostic multisig key
import { makeObservable, observable } from "mobx";

import { KeyType, SerializedKey } from "./keys";
import { Entities } from "../../entities";

export { KeyType };

export class MultisigKey {
  @observable
  protected _keys: Entities<SerializedKey>;

  @observable
  protected _threshold = 0;

  constructor() {
    this._keys = new Entities();
    makeObservable(this);
  }

  public get keys() {
    return this._keys.entities;
  }

  public get threshold() {
    return this._threshold;
  }

  public hasKeyOfType(type: KeyType) {
    return this.keys.some((key) => key.type === type);
  }

  // TODO: add device key
  // TODO: add phone key
  // TODO: add social key
  // TODO: remove key
}
