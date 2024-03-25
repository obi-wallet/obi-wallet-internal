import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import * as R from "ramda";
import invariant from "tiny-invariant";

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
  protected _primaryKey: Key | null = null;

  public get schema() {
    return MultisigKeySchema;
  }

  public constructor(
    protected _chainId: ChainId,
    protected _keys: Key[],
    _primaryKeyIndex: number | null,
    protected _threshold: number,
    protected _factories: {
      Key: AbstractDataStructure<Key, typeof KeySchema>;
      createMultisigKey: (
        chain: ChainId,
        serialized?: AbstractSerialized<typeof MultisigKeySchema>,
      ) => MultisigKey;
    },
  ) {
    if (_primaryKeyIndex !== null) {
      this._primaryKey = _keys[_primaryKeyIndex] ?? null;
    }
  }

  public toJSON(): AbstractSerialized<typeof MultisigKeySchema> | undefined {
    if (!this._keys) {
      return;
    }
    return {
      keys: this._keys.map((key: Key) => key.toJSON()),
      primaryKeyIndex: this.primaryKeyIndex,
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

  public getKeysOfType<T extends KeyType>(type: T) {
    return this._keys.filter(this.isKeyOfType(type));
  }

  public get primaryKey(): KeySubclassTypeMapping[KeyType.Passkey] | null {
    if (
      this._primaryKey &&
      this.isUsableKeyOfType(KeyType.Passkey)(this._primaryKey) &&
      this._keys.includes(this._primaryKey)
    ) {
      return this._primaryKey;
    }
    return null;
  }

  public setPrimaryKey(key: Key) {
    invariant(this._keys.includes(key), "Key not in multisig");
    this._primaryKey = key;
  }

  public addPasskeyKey(keyPair: Secp256k1KeyPair) {
    return this.addKey({
      type: KeyType.Passkey,
      payload: keyPair,
    });
  }

  public removeKey(key: Key) {
    this.setKeys(this._keys.filter((k) => k !== key));
  }

  protected get primaryKeyIndex() {
    if (!this._primaryKey) return null;
    const index = this._keys.indexOf(this._primaryKey);
    return index !== -1 ? index : null;
  }

  protected addKey<T extends KeyType>(key: KeyAbstractSerializedMapping[T]) {
    const newKey = this._factories.Key.create(key);
    this.setKeys([...this._keys, newKey]);
    return newKey;
  }

  protected setKeys(keys: Key[]) {
    this._keys = this.sortKeys(keys);
  }

  protected sortKeys(keys: Key[]) {
    return R.sortWith<Key>([
      R.ascend(R.prop("type")),
      R.ascend((key) => key.publicKey.value),
    ])(keys);
  }

  protected isKeyOfType<T extends KeyType>(type: T) {
    return (key: Key): key is KeySubclassTypeMapping[T] => {
      return key.type === type;
    };
  }

  protected isUsableKeyOfType<T extends KeyType>(type: T) {
    return (key: Key): key is KeySubclassTypeMapping[T] => {
      return key.type === type && key.isUsable;
    };
  }

  protected get sdk() {
    return Sdk.chainId(this._chainId);
  }
}
