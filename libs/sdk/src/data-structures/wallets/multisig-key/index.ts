import { action, makeObservable, observable, toJS } from "mobx";
import * as R from "ramda";
import { z } from "zod";

import {
  AbstractKey,
  Key,
  KeyAbstractSerializedMapping,
  KeySubclassTypeMapping,
  KeyType,
  ObservableKey,
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

  public equals(other: MultisigKey) {
    return R.equals(this.toJSON(), other.toJSON());
  }

  public clone() {
    return MultisigKey.deserialize(this.chain, this.toJSON()) as this;
  }

  public static empty(chain: Chain): MultisigKey {
    return new MultisigKey(...this.emptyConstructorParameters(chain));
  }

  protected static emptyConstructorParameters(
    chain: Chain
  ): ConstructorParameters<typeof MultisigKey> {
    return [chain, [], 1];
  }

  public static deserialize(
    chain: Chain,
    serialized: AbstractMigratable<typeof MultisigKeySchema>
  ): MultisigKey {
    return new MultisigKey(
      ...this.deserializeConstructorParameters(chain, serialized, Key)
    );
  }

  protected static deserializeConstructorParameters(
    chain: Chain,
    serialized: AbstractMigratable<typeof MultisigKeySchema>,
    KeyClass: typeof Key
  ): ConstructorParameters<typeof MultisigKey> {
    const { keys, threshold } =
      MultisigKeySchema.migratableSchema.parse(serialized);
    return [chain, keys.map(KeyClass.deserialize.bind(KeyClass)), threshold];
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
    this._keys.push(this.createKey(key));
  }

  public removeKeyOfType<T extends KeyType>(type: T) {
    this._keys = this._keys.filter((key) => key.type !== type);
  }

  protected createKey = Key.deserialize.bind(Key);
}

export class ObservableMultisigKey extends MultisigKey {
  public constructor(...args: ConstructorParameters<typeof MultisigKey>) {
    super(...args);
    makeObservable<
      ObservableMultisigKey,
      "_chain" | "_keys" | "_threshold" | "createKey"
    >(this, {
      clone: true,
      _chain: observable,
      _keys: observable,
      _threshold: observable,
      toJSON: false,
      createKey: false,
      setThreshold: action,
      setKey: action,
      removeKeyOfType: action,
    });
  }

  public toJSON() {
    return toJS(super.toJSON());
  }

  public clone() {
    return ObservableMultisigKey.deserialize(this.chain, this.toJSON()) as this;
  }

  public static empty(chain: Chain): ObservableMultisigKey {
    return new ObservableMultisigKey(...this.emptyConstructorParameters(chain));
  }

  public static deserialize(
    chain: Chain,
    serialized: AbstractMigratable<typeof MultisigKeySchema>
  ): ObservableMultisigKey {
    return new ObservableMultisigKey(
      ...this.deserializeConstructorParameters(chain, serialized, ObservableKey)
    );
  }

  protected createKey = ObservableKey.deserialize.bind(ObservableKey);
}
