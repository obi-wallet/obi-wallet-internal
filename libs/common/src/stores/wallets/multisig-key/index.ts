// Chain-agnostic multisig key
import { action, makeObservable, observable } from "mobx";

import { KeyType, SerializedKey } from "./keys";
import { SerializedPhoneKeyPayload } from "./keys/phone";
import { Draftable } from "../../drafts/draft";
import { Entities } from "../../entities";

export { KeyType };

export class MultisigKey implements Draftable {
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

  @action
  public setPhoneNumberKey(payload: SerializedPhoneKeyPayload) {
    this._keys.removeBy({
      predicate(key) {
        return key.type === KeyType.Phone;
      },
    });
    this._keys.add({
      entity: {
        type: KeyType.Phone,
        payload,
      },
    });
  }

  public clone() {
    const clone = new MultisigKey();
    clone._threshold = this._threshold;
    clone._keys = this._keys.clone();
    return clone as this;
  }

  public equals(other: MultisigKey) {
    return (
      this._threshold === other._threshold && this._keys.equals(other._keys)
    );
  }

  // TODO: add device key
  // TODO: add social key
  // TODO: remove key
}
