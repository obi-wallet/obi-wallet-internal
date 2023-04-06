import * as R from "ramda";

import { MultisigKeySchema } from "./schema";
import { Chain } from "../../chains";
import {
  MultisigPublicKey,
  Secp256k1KeyPair,
  Secp256k1PublicKey,
} from "../../keys";
import { Sdk } from "../../sdk";
import { Message } from "../../transactions";
import { AbstractDataStructure } from "../abstract";
import {
  Key,
  KeyAbstractSerializedMapping,
  KeySubclassTypeMapping,
  KeyType,
} from "../key";
import { AbstractSerialized } from "../migratable";

export class MultisigKey {
  public get schema() {
    return MultisigKeySchema;
  }

  public constructor(
    protected _chainId: Chain,
    protected _keys: Key[],
    protected _threshold: number,
    protected _factories: {
      Key: AbstractDataStructure<Key>;
      createMultisigKey: (
        chain: Chain,
        serialized: AbstractSerialized<typeof MultisigKeySchema>
      ) => MultisigKey;
    }
  ) {}

  public toJSON(): AbstractSerialized<typeof MultisigKeySchema> {
    return {
      keys: this._keys.map((key) => key.toJSON()),
      threshold: this._threshold,
    };
  }

  public equals(other: MultisigKey) {
    return R.equals(this.toJSON(), other.toJSON());
  }

  public clone() {
    return this._factories.createMultisigKey(this.chainId, this.toJSON());
  }

  public get chainId() {
    return this._chainId;
  }

  public get threshold() {
    return this._threshold;
  }

  public setThreshold(threshold: number) {
    this._threshold = threshold;
  }

  public get publicKey(): MultisigPublicKey {
    return {
      type: "tendermint/PubKeyMultisigThreshold",
      value: {
        pubkeys: this._keys.map((key) => key.publicKey),
        threshold: this._threshold.toString(),
      },
    };
  }

  public get address() {
    return this.sdk.transactions.getAddressOfPublicKey(this.publicKey);
  }

  public get keys() {
    return this._keys;
  }

  public get signerTypes() {
    return this._keys.map((key) => key.type);
  }

  public hasKeyOfType(type: KeyType) {
    return this._keys.some((key) => key.type === type);
  }

  public getKeyOfType<T extends KeyType>(type: T) {
    return this._keys.find((key): key is KeySubclassTypeMapping[T] => {
      return key.type === type;
    });
  }

  public getUsableKeyOfType<T extends KeyType>(type: T) {
    return this._keys.find((key): key is KeySubclassTypeMapping[T] => {
      return key.type === type && key.isUsable;
    });
  }

  public setDeviceKey(publicKey: Secp256k1PublicKey) {
    this.setKey({
      type: KeyType.Device,
      payload: {
        publicKey,
      },
    });
  }

  public setPhoneKey(payload: {
    publicKey: Secp256k1PublicKey;
    phoneNumber: string;
    securityQuestion: string;
  }) {
    this.setKey({
      type: KeyType.Phone,
      payload,
    });
  }

  public setSocialKey(publicKey: Secp256k1PublicKey) {
    this.setKey({
      type: KeyType.Social,
      payload: {
        publicKey,
      },
    });
  }

  public setNfcKey(payload: {
    publicKey: Secp256k1PublicKey;
    localEntropy: string;
  }) {
    this.setKey({
      type: KeyType.Nfc,
      payload,
    });
  }

  public setCloudKey(payload: Secp256k1KeyPair & { provider: "google-drive" }) {
    this.setKey({
      type: KeyType.Cloud,
      payload,
    });
  }

  public setEmailKey(publicKey: Secp256k1PublicKey) {
    this.setKey({
      type: KeyType.Email,
      payload: {
        publicKey,
      },
    });
  }

  protected setKey<T extends KeyType>(key: KeyAbstractSerializedMapping[T]) {
    this._keys = this._keys.filter((k) => key.type !== k.type);
    this._keys.push(this._factories.Key.create(key));
  }

  public removeKeyOfType<T extends KeyType>(type: T) {
    this._keys = this._keys.filter((key) => key.type !== type);
  }

  public async createSigner({ messages }: { messages: Message[] }) {
    return await this.sdk.transactions.createMultisigSigner({
      multisigPublicKey: this.publicKey,
      messages,
    });
  }

  protected get sdk() {
    return Sdk.chainId(this._chainId);
  }
}
