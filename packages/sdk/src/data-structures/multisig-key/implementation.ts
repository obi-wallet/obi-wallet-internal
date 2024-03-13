import {
  Secp256k1KeyPair,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import * as R from "ramda";

import { MultisigKeySchema } from "./schema";
import { ChainId } from "../../chains";
import { MultisigPublicKey } from "../../keys";
import { Sdk } from "../../sdk";
import { AbstractDataStructure } from "../abstract";
import {
  Key,
  KeyAbstractSerializedMapping,
  KeySubclassTypeMapping,
  KeyType,
} from "../key";
import { KeySchema } from "../key/schema";
import { AbstractSerialized } from "../migratable";

export class MultisigKey {
  public get schema() {
    return MultisigKeySchema;
  }

  public constructor(
    protected _chainId: ChainId,
    protected _keys: Key[],
    protected _primaryKeyIndex: number | null,
    protected _threshold: number,
    protected _factories: {
      Key: AbstractDataStructure<Key, typeof KeySchema>;
      createMultisigKey: (
        chain: ChainId,
        serialized?: AbstractSerialized<typeof MultisigKeySchema>,
      ) => MultisigKey;
    },
  ) {}

  public toJSON(): AbstractSerialized<typeof MultisigKeySchema> | undefined {
    if (!this._keys) {
      return;
    }
    return {
      keys: this._keys.map((key: Key) => key.toJSON()),
      primaryKeyIndex: this._primaryKeyIndex,
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
    return this._keys.find(this.isKeyOfType(type));
  }

  public getPrimaryKey(): KeySubclassTypeMapping[KeyType.Passkey] | null {
    const primaryKey =
      this._primaryKeyIndex !== null ? this._keys[this._primaryKeyIndex] : null;
    if (!primaryKey || !this.isUsableKeyOfType(KeyType.Passkey)(primaryKey))
      return null;
    return primaryKey;
  }

  public getUsableKeyOfType<T extends KeyType>(type: T) {
    return this._keys.find(this.isUsableKeyOfType(type));
  }

  public setPasskeyKey(keyPair: Secp256k1KeyPair) {
    this.setKey({
      type: KeyType.Passkey,
      payload: keyPair,
    });
  }

  public setPhoneKey(payload: {
    publicKey: Secp256k1PublicKey;
    privateKey: string;
    phoneNumber: string;
    securityQuestion: string;
  }) {
    this.setKey({
      type: KeyType.Phone,
      payload,
    });
    // console.log("Current multisig draft is: " + JSON.stringify(this));
  }
  public setTelegramKey(payload: {
    publicKey: Secp256k1PublicKey;
    privateKey: string;
    chatID: string;
    securityQuestion: string;
  }) {
    this.setKey({
      type: KeyType.Telegram,
      payload,
    });
    // console.log("Current multisig draft is: " + JSON.stringify(this));
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

  public setEmailRecoveryKey(key: Secp256k1KeyPair) {
    this.setKey({
      type: KeyType.EmailRecovery,
      payload: key,
    });
  }

  public setZAuthKey(publicKey: Secp256k1PublicKey) {
    this.setKey({
      type: KeyType.ZAuth,
      payload: {
        publicKey,
        privateKey: "",
      },
    });
  }

  protected setKey<T extends KeyType>(key: KeyAbstractSerializedMapping[T]) {
    this._keys = this._keys.filter((k) => key.type !== k.type);
    this._keys.push(this._factories.Key.create(key));
    // sort the keys by type, and then by public key
    this._keys = this._keys.sort((a, b) => {
      if (a.type < b.type) {
        return -1;
      } else if (a.type > b.type) {
        return 1;
      } else {
        if (a.publicKey.value < b.publicKey.value) {
          return -1;
        } else if (a.publicKey.value > b.publicKey.value) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }

  public removeKeyOfType<T extends KeyType>(type: T) {
    this._keys = this._keys.filter((key) => key.type !== type);
  }

  protected isKeyOfType<T extends KeyType>(type: T) {
    return (key: Key): key is KeySubclassTypeMapping[T] => key.type === type;
  }

  protected isUsableKeyOfType<T extends KeyType>(type: T) {
    return (key: Key): key is KeySubclassTypeMapping[T] =>
      key.type === type && key.isUsable;
  }

  protected get sdk() {
    return Sdk.chainId(this._chainId);
  }
}
