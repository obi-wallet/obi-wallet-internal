import { KeySchema, PendingRecoveryKeySchema, UsableKeySchema } from "./schema";
import { AbstractSerialized } from "../migratable";

export abstract class Key {
  public static get schema() {
    return KeySchema;
  }

  protected constructor(
    protected serialized: AbstractSerialized<typeof KeySchema>,
    protected _serialize: <T>(serialized: T) => T
  ) {}
  public get publicKey() {
    return this.serialized.payload.publicKey;
  }
  public abstract get isUsable(): boolean;
  public abstract get type(): string;
  public toJSON() {
    return this._serialize(this.serialized);
  }
}

export class UsableKey<
  T extends AbstractSerialized<typeof UsableKeySchema>
> extends Key {
  public constructor(
    protected serialized: T,
    protected _serialize: <T>(serialized: T) => T
  ) {
    super(serialized, _serialize);
  }

  public get isUsable() {
    return true;
  }

  public get type(): T["type"] {
    return this.serialized.type;
  }

  public get payload(): T["payload"] {
    return this.serialized.payload;
  }
}

export class PendingRecoveryKey extends Key {
  public constructor(
    protected serialized: AbstractSerialized<typeof PendingRecoveryKeySchema>,
    protected _serialize: <T>(serialized: T) => T
  ) {
    super(serialized, _serialize);
  }

  public get isUsable() {
    return false;
  }

  public get type(): string {
    return this.serialized.payload.type;
  }
}
