import * as R from "ramda";

import { MultisigKeyInterface } from "./interface";
import {
  Key,
  KeyAbstractSerializedMapping,
  KeySubclassTypeMapping,
  KeyType,
} from "./keys";
import { MultisigKeySchema } from "./schema";
import { Chain } from "../../chains";
import { MultisigPublicKey } from "../../keys";
import { Sdk } from "../../sdk";
import { Serialized } from "../abstract";
import { AbstractSerialized } from "../migratable";

export class MultisigKey implements MultisigKeyInterface {
  public get schema() {
    return MultisigKeySchema;
  }

  public constructor(
    protected _chain: Chain,
    protected _keys: Key[],
    protected _threshold: number,
    protected _factories: {
      createKey: (serialized: Serialized<typeof Key>) => Key;
      createMultisigKey: (
        chain: Chain,
        serialized: AbstractSerialized<typeof MultisigKeySchema>
      ) => MultisigKeyInterface;
    }
  ) {}

  public toJSON(): AbstractSerialized<typeof MultisigKeySchema> {
    return {
      keys: this._keys.map((key) => key.toJSON()),
      threshold: this._threshold,
    };
  }

  public equals(other: MultisigKeyInterface) {
    return R.equals(this.toJSON(), other.toJSON());
  }

  public clone() {
    return this._factories.createMultisigKey(this.chain, this.toJSON());
  }

  public get chain() {
    return this._chain;
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
    return Sdk.chainId(this._chain).getAddressOfPublicKey({
      publicKey: this.publicKey,
    });
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

  public setKey<T extends KeyType>(key: KeyAbstractSerializedMapping[T]) {
    this._keys = this._keys.filter((k) => key.type !== k.type);
    this._keys.push(this._factories.createKey(key));
  }

  public removeKeyOfType<T extends KeyType>(type: T) {
    this._keys = this._keys.filter((key) => key.type !== type);
  }
}
