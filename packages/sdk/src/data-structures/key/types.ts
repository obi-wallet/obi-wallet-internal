import { UsableKey } from "./implementation";
import { UsableKeySchema } from "./schema";
import { AbstractSerialized } from "../migratable";

export enum KeyType {
  Passkey = "passkey",
  Phone = "phone",
  Telegram = "telegram",
  Cloudkey = "cloudkey",
}

export type KeyAbstractSerializedMapping = {
  [T in KeyType]: AbstractSerialized<typeof UsableKeySchema> & { type: T };
};

export type KeySubclassTypeMapping = {
  [T in KeyType]: UsableKey<KeyAbstractSerializedMapping[T]>;
};
