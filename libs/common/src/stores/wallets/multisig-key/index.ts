import { action, computed, makeObservable, observable } from "mobx";

import {
  KeyType,
  SerializedKey,
  SerializedMultisigKey,
  SerializedPendingRecoveryKey,
} from "./keys";
import { SerializedCloudKeyPayload } from "./keys/cloud";
import { SerializedDeviceKeyPayload } from "./keys/device";
import { SerializedNfcKeyPayload } from "./keys/nfc";
import { SerializedEmailKeyPayload } from "./keys/email";
import { SerializedPhoneKeyPayload } from "./keys/phone";
import { SerializedSocialKeyPayload } from "./keys/social";
import { Chain, isTerraChain } from "../../../chains";
import { cosmos, terra } from "../../../networks";
import { Draftable } from "../../drafts/draft";
import { Entities } from "../../entities";

export * as MultisigKeySerializedData from "./keys";

export { KeyType, SerializedMultisigKey };

// Chain-agnostic multisig key
export class MultisigKey implements Draftable {
  @observable
  protected _chain: Chain;

  @observable
  protected _keys: Entities<SerializedKey | SerializedPendingRecoveryKey>;

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
    return this.keys.some((key) => {
      return getTypeOfKey(key) === type;
    });
  }

  public getKeyOfType<T extends KeyType>(
    type: T
  ):
    | (
        | (SerializedKey & { type: T })
        | (SerializedPendingRecoveryKey & { payload: { type: T } })
      )
    | undefined {
    return this.keys.find((key) => {
      return getTypeOfKey(key) === type;
    }) as
      | (
          | (SerializedKey & { type: T })
          | (SerializedPendingRecoveryKey & { payload: { type: T } })
        )
      | undefined;
  }

  public getUsableKeyOfType<T extends KeyType>(
    type: T
  ): (SerializedKey & { type: T }) | undefined {
    return this.keys.find((key) => {
      return SerializedKey.is(key) && key.type === type;
    }) as (SerializedKey & { type: T }) | undefined;
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
  public setEmailKey(payload: SerializedEmailKeyPayload) {
    this.setKey({
      type: KeyType.Email,
      payload,
    });
  }

  @action
  public removeSocialKey() {
    this.removeKeyOfType(KeyType.Social);
  }

  @action
  public setNfcKey(payload: SerializedNfcKeyPayload) {
    this.setKey({
      type: KeyType.Nfc,
      payload,
    });
  }

  @action
  public removeNfcKey() {
    this.removeKeyOfType(KeyType.Nfc);
  }

  @action
  public setCloudKey(payload: SerializedCloudKeyPayload) {
    this.setKey({
      type: KeyType.Cloud,
      payload,
    });
  }

  @action
  public recoverCloudKey(payload: SerializedCloudKeyPayload) {
    // TODO: as soon as we allow multiple cloud keys, we need to replace the one
    // with the matching public key.
    this.setCloudKey(payload);
  }

  @action
  public removeCloudKey() {
    this.removeKeyOfType(KeyType.Cloud);
  }

  @action
  public removeEmailKey() {
    this.removeKeyOfType(KeyType.Email);
  }

  @action
  protected removeKeyOfType(type: KeyType) {
    this._keys.removeBy({
      predicate(key) {
        return getTypeOfKey(key) === type;
      },
    });
  }

  @action
  protected setKey(serializedKey: SerializedKey) {
    this._keys.removeBy({
      predicate(key) {
        return getTypeOfKey(key) === serializedKey.type;
      },
    });
    this._keys.add({
      entity: serializedKey,
    });
    this._threshold = Math.max(1, this._threshold);
  }

  @computed
  public get signerTypes() {
    return this.keys.map((key) => getTypeOfKey(key));
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

function getTypeOfKey(
  key: SerializedKey | SerializedPendingRecoveryKey
): string {
  if (SerializedKey.is(key)) {
    return key.type;
  } else {
    return key.payload.type;
  }
}
