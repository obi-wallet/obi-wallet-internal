import { z } from "zod";

import {
  AbstractKey,
  Key,
  KeyAbstractSerializedMapping,
  KeySubclassTypeMapping,
  KeyType,
  UsableKey,
} from "./keys";
import { Chain } from "../../../chains";
import { MultisigPublicKey } from "../../../keys";
import { Sdk } from "../../../sdk";
import { AbstractMigratable, AbstractSerialized } from "../../abstract";
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
    protected _keys: AbstractKey[],
    protected _threshold: number
  ) {}

  public toJSON(): AbstractSerialized<typeof MultisigKeySchema> {
    return {
      keys: this._keys.map((key) => key.toJSON()),
      threshold: this._threshold,
    };
  }

  public static empty(chain: Chain): MultisigKey {
    return new MultisigKey(chain, [], 1);
  }

  public static deserialize(
    chain: Chain,
    serialized: AbstractMigratable<typeof MultisigKeySchema>
  ): MultisigKey {
    const { keys, threshold } =
      MultisigKeySchema.migratableSchema.parse(serialized);
    return new MultisigKey(chain, keys.map(Key.deserialize), threshold);
  }

  public get chain() {
    return this._chain;
  }

  public get threshold() {
    return this._threshold;
  }

  public setThreshold(threshold: number) {
    return new MultisigKey(this._chain, this._keys, threshold);
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
    return [...this._keys];
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
    const keys = this._keys.filter((k) => key.type !== k.type);
    keys.push(new UsableKey(key));
    return new MultisigKey(this._chain, keys, this._threshold);
  }

  public removeKeyOfType<T extends KeyType>(type: T) {
    const keys = this._keys.filter((key) => key.type !== type);
    return new MultisigKey(this._chain, keys, this._threshold);
  }
}
