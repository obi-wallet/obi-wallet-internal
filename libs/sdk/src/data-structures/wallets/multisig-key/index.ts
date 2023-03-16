import { z } from "zod";

import { AbstractKey, Key, KeyType, UsableKey } from "./keys";
import { MultisigPublicKey } from "../../../keys";
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
    protected _keys: AbstractKey[],
    protected _threshold: number
  ) {}

  public toJSON(): AbstractSerialized<typeof MultisigKeySchema> {
    return {
      keys: this._keys.map((key) => key.toJSON()),
      threshold: this._threshold,
    };
  }

  public static empty(): MultisigKey {
    return new MultisigKey([], 0);
  }

  public static deserialize(
    serialized: AbstractMigratable<typeof MultisigKeySchema>
  ): MultisigKey {
    const { keys, threshold } =
      MultisigKeySchema.migratableSchema.parse(serialized);
    return new MultisigKey(keys.map(Key.deserialize), threshold);
  }

  public get keys() {
    return [...this._keys];
  }

  public get threshold() {
    return this._threshold;
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

  public get signerTypes() {
    return this._keys.map((key) => key.type);
  }

  public setThreshold(threshold: number) {
    return new MultisigKey(this._keys, threshold);
  }

  public hasKeyOfType(type: KeyType) {
    return this._keys.some((key) => key.type === type);
  }

  public getKeyOfType<T extends KeyType>(type: T) {
    return this._keys.find((key): key is AbstractKey & { type: T } => {
      return key.type === type;
    });
  }

  public getUsableKeyOfType<T extends KeyType>(type: T) {
    return this._keys.find((key): key is UsableKey<T> => {
      return key.type === type && key.isUsable;
    });
  }

  public setKey<T extends KeyType>(
    key: Serialized<typeof UsableKey> & { type: T }
  ) {
    const keys = this._keys.filter((k) => key.type !== k.type);
    keys.push(new UsableKey<T>(key));
    const threshold = Math.max(1, this._threshold);
    return new MultisigKey(keys, threshold);
  }

  public removeKeyOfType<T extends KeyType>(type: T) {
    const keys = this._keys.filter((key) => key.type !== type);
    return new MultisigKey(keys, this._threshold);
  }
}
