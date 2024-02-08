import { UsableKey } from "./implementation";
import { UsableKeySchema } from "./schema";
import { AbstractSerialized } from "../migratable";

export enum KeyType {
  Device = "device",
  Passkey = "passkey",
  Phone = "phone",
  Social = "social",
  Nfc = "nfc",
  Cloud = "cloud",
  Email = "email",
  EmailRecovery = "email-recovery",
  Unity = "unity",
  ZAuth = "z-auth",
  Telegram = "telegram",
}

export type KeyAbstractSerializedMapping = {
  [T in KeyType]: AbstractSerialized<typeof UsableKeySchema> & { type: T };
};

export type KeySubclassTypeMapping = {
  [T in KeyType]: UsableKey<KeyAbstractSerializedMapping[T]>;
};
