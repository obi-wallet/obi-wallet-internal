import { createKey, createObservableKey } from "./factories";
import { Key as KeyInterface } from "./implementation";
import { LegacyKeySchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export { UsableKeySchema, PendingRecoveryKeySchema } from "./schema";
export * from "./types";
export type Key = KeyInterface;

export { KeySchema, LegacyKeySchema } from "./schema";

export const Key = {
  schema: LegacyKeySchema,
  create: createKey,
} satisfies AbstractDataStructure<Key, typeof LegacyKeySchema>;

export const ObservableKey = {
  schema: LegacyKeySchema,
  create: createObservableKey,
} satisfies AbstractDataStructure<Key, typeof LegacyKeySchema>;
