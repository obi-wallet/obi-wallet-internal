import { UsableKey } from "./implementation";
import { UsableKeySchema } from "./schema";
import { AbstractSerialized } from "../migratable";

export enum KeyType {
  Device = "device",
  Phone = "phone",
  Social = "social",
  Nfc = "nfc",
  Cloud = "cloud",
  Email = "email",
}

export type KeyAbstractSerializedMapping = {
  [T in KeyType]: AbstractSerialized<typeof UsableKeySchema> & { type: T };
};

export type KeySubclassTypeMapping = {
  [T in KeyType]: UsableKey<KeyAbstractSerializedMapping[T]>;
};
