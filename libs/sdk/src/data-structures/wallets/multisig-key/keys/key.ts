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
    public serialized: AbstractSerialized<typeof KeySchema>
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

// TODO: need to go one level deeper to be able to make serialized protected
export class UsableKey<T extends KeyType> extends AbstractKey {
  public static get schema() {
    return UsableKeySchema;
  }

  public constructor(
    public serialized: AbstractSerialized<typeof UsableKeySchema> & {
      type: T;
    }
  ) {
    super(serialized);
  }

  public get isUsable() {
    return true;
  }

  public get type() {
    return this.serialized.type;
  }
}

export class PendingRecoverKey extends AbstractKey {
  public static get schema() {
    return PendingRecoverKeySchema;
  }

  public constructor(
    public serialized: AbstractSerialized<typeof PendingRecoverKeySchema>
  ) {
    super(serialized);
  }

  public get isUsable() {
    return false;
  }

  public get type() {
    return this.serialized.payload.type;
  }
}

export class Key {
  public static get schema() {
    return KeySchema;
  }

  public static deserialize(
    serialized: AbstractMigratable<typeof KeySchema>
  ): AbstractKey {
    const result =
      PendingRecoverKey.schema.migratableSchema.safeParse(serialized);
    if (result.success) return new PendingRecoverKey(result.data);
    return new UsableKey(UsableKey.schema.migratableSchema.parse(serialized));
  }
}
