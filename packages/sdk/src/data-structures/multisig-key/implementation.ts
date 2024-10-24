import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import * as R from "ramda";
import invariant from "tiny-invariant";
import { z } from "zod";

import { ChainId } from "../../chains";
import { MultisigPublicKey } from "../../keys";
import { Sdk } from "../../sdk";
import { KeySchema, KeySubclassTypeMapping, KeyType } from "../key";
import { MultisigKeySchema } from "./schema";

export class MultisigKey {
  protected _primaryKey: z.infer<typeof KeySchema> | null = null;

  public constructor(
    protected _chainId: ChainId,
    protected _keys: z.infer<typeof KeySchema>[],
    _primaryKeyIndex: number | null,
    protected _threshold: number,
    protected _factories: {
      createMultisigKey: (
        chain: ChainId,
        serialized?: z.infer<typeof MultisigKeySchema>,
      ) => MultisigKey;
    },
  ) {
    if (_primaryKeyIndex !== null) {
      this._primaryKey = _keys[_primaryKeyIndex] ?? null;
    }
  }

  public toJSON(): z.infer<typeof MultisigKeySchema> {
    return {
      keys: this._keys,
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
        pubkeys: this._keys.map((key) => {
          return key.publicKey;
        }),
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

  public get primaryKey(): z.infer<typeof KeySchema> | null {
    if (this._primaryKey && this.isKeyInMultisig(this._primaryKey)) {
      return this._primaryKey;
    }
    return null;
  }

  public setPrimaryKey(key: z.infer<typeof KeySchema>) {
    invariant(this.isKeyInMultisig(key), "Key not in multisig");
    this._primaryKey = key;
  }

  public addPasskeyKey(publicKey: Secp256k1PublicKey) {
    return this.addKey({
      type: KeyType.Passkey,
      publicKey,
    });
  }

  public addPhoneKey(publicKey: Secp256k1PublicKey) {
    return this.addKey({
      type: KeyType.Phone,
      publicKey,
    });
  }

  public addTelegramKey(publicKey: Secp256k1PublicKey) {
    return this.addKey({
      type: KeyType.Telegram,
      publicKey,
    });
  }

  public addCloudKey(publicKey: Secp256k1PublicKey) {
    return this.addKey({
      type: KeyType.Cloud,
      publicKey,
    });
  }

  public findKeyByPublicKey(publicKey: Secp256k1PublicKey) {
    return this._keys.find((key) => {
      return key.publicKey.value === publicKey.value;
    });
  }

  public removeKeyByPublicKey(publicKey: Secp256k1PublicKey) {
    this.setKeys(
      this._keys.filter((key) => {
        return key.publicKey.value !== publicKey.value;
      }),
    );
  }

  public removeKey(key: z.infer<typeof KeySchema>) {
    this.setKeys(
      this._keys.filter((k) => {
        return k !== key;
      }),
    );
  }

  protected get primaryKeyIndex() {
    const primaryKey = this._primaryKey;
    if (!primaryKey) return null;
    const index = this._keys.findIndex((key) => {
      return key.publicKey.value === primaryKey.publicKey.value;
    });
    return index !== -1 ? index : null;
  }

  protected addKey(key: z.infer<typeof KeySchema>) {
    this.setKeys([...this._keys, key]);
    return key;
  }

  protected setKeys(keys: z.infer<typeof KeySchema>[]) {
    this._keys = this.sortKeys(keys);
  }

  protected sortKeys(keys: z.infer<typeof KeySchema>[]) {
    return R.sortWith<z.infer<typeof KeySchema>>([
      R.ascend(R.prop("type")),
      R.ascend((key) => {
        return key.publicKey.value;
      }),
    ])(keys);
  }

  protected isKeyOfType<T extends KeyType>(type: T) {
    return (
      key: z.infer<typeof KeySchema>,
    ): key is KeySubclassTypeMapping[T] => {
      return key.type === type;
    };
  }

  protected isKeyInMultisig(key: z.infer<typeof KeySchema>) {
    return this._keys.some((k) => {
      return k.type === key.type && k.publicKey.value === key.publicKey.value;
    });
  }

  protected get sdk() {
    return Sdk.chainId(this._chainId);
  }
}
