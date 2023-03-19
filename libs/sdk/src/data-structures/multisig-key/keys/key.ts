import { makeObservable, observable } from "mobx";
import { z } from "zod";

import { CloudKey } from "./cloud";
import { DeviceKey } from "./device";
import { EmailKey } from "./email";
import { KeyType } from "./key-type";
import { NfcKey } from "./nfc";
import { PhoneKey } from "./phone";
import { SocialKey } from "./social";
import { Secp256k1PublicKey } from "../../../keys";
import {
  AbstractMigratable,
  AbstractSerialized,
  migratable,
} from "../../migratable";

const UsableKeySchema = migratable(
  z.union([DeviceKey, PhoneKey, SocialKey, NfcKey, CloudKey, EmailKey])
);

const PendingRecoveryKeySchema = migratable(
  z.object({
    payload: z.object({
      type: z.string(),
      publicKey: Secp256k1PublicKey,
    }),
  })
);

export const KeySchema = migratable(
  z.union([
    UsableKeySchema.migratableSchema,
    PendingRecoveryKeySchema.migratableSchema,
  ])
);

export abstract class Key {
  public static get schema() {
    return KeySchema;
  }

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
> extends Key {
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

export class PendingRecoveryKey extends Key {
  public constructor(
    protected serialized: AbstractSerialized<typeof PendingRecoveryKeySchema>
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

export function createKey(serialized: AbstractMigratable<typeof KeySchema>) {
  const result =
    PendingRecoveryKeySchema.migratableSchema.safeParse(serialized);
  if (result.success) return new PendingRecoveryKey(result.data);
  return new UsableKey(UsableKeySchema.migratableSchema.parse(serialized));
}

export function createObservableKey(
  serialized: AbstractMigratable<typeof KeySchema>
) {
  const key = createKey(serialized);
  makeObservable<Key, "serialized">(
    key,
    {
      serialized: observable,
      toJSON: false,
    },
    {
      name: "Key",
    }
  );
  return key;
}

export type KeyAbstractSerializedMapping = {
  [T in KeyType]: AbstractSerialized<typeof UsableKeySchema> & { type: T };
};

export type KeySubclassTypeMapping = {
  [T in KeyType]: UsableKey<KeyAbstractSerializedMapping[T]>;
};
