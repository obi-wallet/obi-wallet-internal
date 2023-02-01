import { action, computed, makeObservable, observable } from "mobx";

import { KeyType, SerializedKey, SerializedMultisigKey } from "./keys";
import { SerializedDeviceKeyPayload } from "./keys/device";
import { SerializedPhoneKeyPayload } from "./keys/phone";
import { SerializedSocialKeyPayload } from "./keys/social";
import { Chain, isTerraChain } from "../../../chains";
import { cosmos, terra } from "../../../networks";
import { Draftable } from "../../drafts/draft";
import { Entities } from "../../entities";

export { KeyType, SerializedMultisigKey };

// Chain-agnostic multisig key
export class MultisigKey implements Draftable {
  @observable
  protected _chain: Chain;

  @observable
  protected _keys: Entities<SerializedKey>;

  @observable
  protected _threshold = 0;

  constructor({ chain }: { chain: Chain }) {
    this._chain = chain;
    this._keys = new Entities();
    makeObservable(this);
  }

  public get chain() {
    return this._chain;
  }

  public get keys() {
    return this._keys.entities;
  }

  public get threshold() {
    return this._threshold;
  }

  @computed
  public get address() {
    if (isTerraChain(this.chain)) {
      const multisigPublicKey = terra.createMultisigPublicKey({
        multisigKey: this,
      });
      return multisigPublicKey.address();
    } else {
      const multisigPublicKey = cosmos.createMultisigPublicKey({
        multisigKey: this,
      });
      return cosmos.getAddress({
        publicKey: multisigPublicKey,
        chainId: this.chain,
      });
    }
  }

  @action
  public setThreshold(threshold: number) {
    this._threshold = threshold;
  }

  public hasKeyOfType(type: KeyType) {
    return this.keys.some((key) => key.type === type);
  }

  public getKeyOfType<T extends KeyType>(
    type: T
  ): (SerializedKey & { type: T }) | undefined {
    return this.keys.find((key) => key.type === type) as
      | (SerializedKey & { type: T })
      | undefined;
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
  public removeSocialKey() {
    this.removeKeyOfType(KeyType.Social);
  }

  @action
  protected removeKeyOfType(type: KeyType) {
    this._keys.removeBy({
      predicate(key) {
        return key.type === type;
      },
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

  @computed
  public get signerTypes() {
    return this.keys.map((key) => key.type);
  }

  public serialize(): SerializedMultisigKey {
    return {
      keys: this.keys,
      threshold: this._threshold,
    };
  }

  public clone() {
    const clone = new MultisigKey({ chain: this.chain });
    clone._threshold = this._threshold;
    clone._keys = this._keys.clone();
    return clone as this;
  }

  public equals(other: MultisigKey) {
    return (
      this._threshold === other._threshold && this._keys.equals(other._keys)
    );
  }

  public static deserialize({
    chain,
    serialized,
  }: {
    chain: Chain;
    serialized: SerializedMultisigKey;
  }) {
    const multisigKey = new MultisigKey({ chain });
    multisigKey._threshold = serialized.threshold;
    serialized.keys.forEach((key) => {
      multisigKey._keys.add({ entity: key });
    });
    return multisigKey;
  }
}
