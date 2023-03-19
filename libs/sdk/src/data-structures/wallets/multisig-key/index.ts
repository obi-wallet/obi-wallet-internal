import { action, makeObservable, observable } from "mobx";
import * as R from "ramda";
import { z } from "zod";

import {
  createKey,
  createObservableKey,
  Key,
  KeyAbstractSerializedMapping,
  KeySubclassTypeMapping,
  KeyType,
} from "./keys";
import { Chain } from "../../../chains";
import { MultisigPublicKey } from "../../../keys";
import { Sdk } from "../../../sdk";
import {
  AbstractMigratable,
  AbstractSerialized,
  Serialized,
} from "../../abstract";
import { migratable } from "../../migratable";

export * from "./keys";

const MultisigKeySchema = migratable(
  z.object({
    keys: z.array(Key.schema.migratableSchema),
    threshold: z.number().int().positive(),
  })
);

export class MultisigKey {
  public static get schema() {
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

export function createMultisigKey(
  chain: Chain,
  serialized: AbstractMigratable<typeof MultisigKeySchema> = {
    keys: [],
    threshold: 1,
  },
  factories = {
    createKey,
    createMultisigKey,
  }
) {
  const { keys, threshold } =
    MultisigKeySchema.migratableSchema.parse(serialized);
  return new MultisigKey(
    chain,
    keys.map((key) => factories.createKey(key)),
    threshold,
    factories
  );
}

export function createObservableMultisigKey(
  chain: Chain,
  serialized?: AbstractMigratable<typeof MultisigKeySchema>
) {
  const key = createMultisigKey(chain, serialized, {
    createKey: createObservableKey,
    createMultisigKey: createObservableMultisigKey,
  });
  makeObservable<MultisigKey, "_chain" | "_keys" | "_threshold">(
    key,
    {
      _chain: observable,
      _keys: observable,
      _threshold: observable,
      toJSON: false,
      clone: false,
      setThreshold: action,
      setKey: action,
      removeKeyOfType: action,
    },
    {
      name: "MultisigKey",
    }
  );
  return key;
}
