// Chain-agnostic multisig key
import { action, makeObservable, observable } from "mobx";

import { KeyType, SerializedKey } from "./keys";
import { SerializedDeviceKeyPayload } from "./keys/device";
import { SerializedPhoneKeyPayload } from "./keys/phone";
import { SerializedSocialKeyPayload } from "./keys/social";
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

  public getKeyOfType(type: KeyType) {
    return this.keys.find((key) => key.type === type);
  }

  @action
  public setDeviceKey(payload: SerializedDeviceKeyPayload) {
    this.setKey({
      type: KeyType.Device,
      payload,
    });
  }

  @action
  public setPhoneKey(payload: SerializedPhoneKeyPayload) {
    this.setKey({
      type: KeyType.Phone,
      payload,
    });
  }

  @action
  public setSocialKey(payload: SerializedSocialKeyPayload) {
    this.setKey({
      type: KeyType.Social,
      payload,
    });
  }

  @action
  protected setKey(serializedKey: SerializedKey) {
    this._keys.removeBy({
      predicate(key) {
        return key.type === serializedKey.type;
      },
    });
    this._keys.add({
      entity: serializedKey,
    });
    this._threshold = Math.max(1, this._threshold);
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
