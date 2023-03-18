import { makeObservable, observable, toJS } from "mobx";
import { z } from "zod";

import { CloudKey } from "./cloud";
import { DeviceKey } from "./device";
import { EmailKey } from "./email";
import { KeyType } from "./key-type";
import { NfcKey } from "./nfc";
import { PhoneKey } from "./phone";
import { SocialKey } from "./social";
import { Secp256k1PublicKey } from "../../../../keys";
import { AbstractMigratable, AbstractSerialized } from "../../../abstract";
import { migratable } from "../../../migratable";

const UsableKeySchema = migratable(
  z.union([DeviceKey, PhoneKey, SocialKey, NfcKey, CloudKey, EmailKey])
);

const PendingRecoverKeySchema = migratable(
  z.object({
    payload: z.object({
      type: z.string(),
      publicKey: Secp256k1PublicKey,
    }),
  })
);

const KeySchema = migratable(
  z.union([
    UsableKeySchema.migratableSchema,
    PendingRecoverKeySchema.migratableSchema,
  ])
);

export abstract class AbstractKey {
  protected constructor(
    protected serialized: AbstractSerialized<typeof KeySchema>
  ) {}
  public get publicKey() {
    return this.serialized.payload.publicKey;
  }
  public abstract get isUsable(): boolean;
  public abstract get type(): string;
  public toJSON() {
    return this.serialized;
  }
}

export class UsableKey<
  T extends AbstractSerialized<typeof UsableKeySchema>
> extends AbstractKey {
  public static get schema() {
    return UsableKeySchema;
  }

  public constructor(protected serialized: T) {
    super(serialized);
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

export class ObservableUsableKey<
  T extends AbstractSerialized<typeof UsableKeySchema>
> extends UsableKey<T> {
  public constructor(...args: ConstructorParameters<typeof UsableKey<T>>) {
    super(...args);
    makeObservable<UsableKey<T>, "serialized">(this, {
      serialized: observable,
      toJSON: false,
    });
  }

  public toJSON() {
    return toJS(super.toJSON());
  }
}

export class PendingRecoveryKey extends AbstractKey {
  public static get schema() {
    return PendingRecoverKeySchema;
  }

  public constructor(
    protected serialized: AbstractSerialized<typeof PendingRecoverKeySchema>
  ) {
    super(serialized);
  }

  public get isUsable() {
    return false;
  }

  public get type(): string {
    return this.serialized.payload.type;
  }
}

export class ObservablePendingRecoveryKey extends PendingRecoveryKey {
  public constructor(
    ...args: ConstructorParameters<typeof PendingRecoveryKey>
  ) {
    super(...args);
    makeObservable<PendingRecoveryKey, "serialized">(this, {
      serialized: observable,
      toJSON: false,
    });
  }

  public toJSON() {
    return toJS(super.toJSON());
  }
}

export class Key {
  public static get schema() {
    return KeySchema;
  }

  public static deserialize(
    serialized: AbstractMigratable<typeof KeySchema>
  ): AbstractKey {
    return this.deserializeWithClasses(
      serialized,
      UsableKey,
      PendingRecoveryKey
    );
  }

  protected static deserializeWithClasses(
    serialized: AbstractMigratable<typeof KeySchema>,
    UsableKeyClass: typeof UsableKey,
    PendingRecoveryKeyClass: typeof PendingRecoveryKey
  ) {
    const result =
      PendingRecoveryKey.schema.migratableSchema.safeParse(serialized);
    if (result.success) return new PendingRecoveryKeyClass(result.data);
    return new UsableKeyClass(
      UsableKey.schema.migratableSchema.parse(serialized)
    );
  }
}

export class ObservableKey extends Key {
  public static deserialize(
    serialized: AbstractMigratable<typeof KeySchema>
  ): AbstractKey {
    return this.deserializeWithClasses(
      serialized,
      ObservableUsableKey,
      ObservablePendingRecoveryKey
    );
  }
}

export type KeyAbstractSerializedMapping = {
  [T in KeyType]: AbstractSerialized<typeof UsableKeySchema> & { type: T };
};

export type KeySubclassTypeMapping = {
  [T in KeyType]: UsableKey<KeyAbstractSerializedMapping[T]>;
};
