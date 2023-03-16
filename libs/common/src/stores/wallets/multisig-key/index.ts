import { Chain, MultisigPublicKey, Sdk } from "@obi-wallet/sdk";
import { MultisigKey as MultisigKeySdk, KeyType } from "@obi-wallet/sdk";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import * as R from "ramda";

import {
  SerializedKey,
  SerializedMultisigKey,
  SerializedPendingRecoveryKey,
} from "./keys";
import { SerializedCloudKeyPayload } from "./keys/cloud";
import { SerializedDeviceKeyPayload } from "./keys/device";
import { SerializedEmailKeyPayload } from "./keys/email";
import { SerializedNfcKeyPayload } from "./keys/nfc";
import { SerializedPhoneKeyPayload } from "./keys/phone";
import { SerializedSocialKeyPayload } from "./keys/social";
import { Draftable } from "../../drafts/draft";
import { Entities } from "../../entities";

export * as MultisigKeySerializedData from "./keys";

export { KeyType, SerializedMultisigKey };

// Chain-agnostic multisig key
export class MultisigKey implements Draftable {
  @observable.ref
  protected _multisigKey: MultisigKeySdk;

  public get multisigKey() {
    return this._multisigKey;
  }

  @action
  public mutate(multisigKey: MultisigKeySdk) {
    this._multisigKey = multisigKey;
  }

  @observable
  protected _chain: Chain;

  @observable
  protected _keys: Entities<SerializedKey | SerializedPendingRecoveryKey>;

  @observable
  protected _threshold = 0;

  constructor({ chain }: { chain: Chain }) {
    this._chain = chain;
    this._keys = new Entities();
    this._multisigKey = MultisigKeySdk.empty();
    makeObservable(this);
    autorun(() => {
      console.log(this._multisigKey.toJSON());
    });
  }

  public get chain() {
    return this._chain;
  }

  public get keys() {
    return this._multisigKey.keys;
  }

  public get threshold() {
    return this._multisigKey.threshold;
  }

  @computed
  public get publicKey(): MultisigPublicKey {
    return this._multisigKey.publicKey;
  }

  @computed
  public get address() {
    return Sdk.chainId(this.chain).getAddressOfPublicKey({
      publicKey: this.publicKey,
    });
  }

  @action
  public setThreshold(threshold: number) {
    this._threshold = threshold;
  }

  public hasKeyOfType(type: KeyType) {
    return this._multisigKey.hasKeyOfType(type);
  }

  public getKeyOfType<T extends KeyType>(type: T) {
    return this._multisigKey.getKeyOfType(type);
  }

  public getUsableKeyOfType<T extends KeyType>(type: T) {
    return this._multisigKey.getUsableKeyOfType<T>(type);
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
    this.mutate(this._multisigKey.removeKeyOfType(type));
  }

  @action
  protected setKey(serializedKey: SerializedKey) {
    this.mutate(this._multisigKey.setKey<KeyType>(serializedKey));
  }

  @computed
  public get signerTypes() {
    return this._multisigKey.signerTypes;
  }

  public serialize(): SerializedMultisigKey {
    return this._multisigKey.toJSON();
  }

  public clone() {
    return MultisigKey.deserialize({
      chain: this.chain,
      serialized: this.serialize(),
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
    serialized: SerializedMultisigKey;
  }) {
    const multisigKey = new MultisigKey({ chain });
    multisigKey.mutate(MultisigKeySdk.deserialize(serialized));
    multisigKey._threshold = serialized.threshold;
    multisigKey._keys = Entities.deserialize(serialized.keys);
    return multisigKey;
  }
}
