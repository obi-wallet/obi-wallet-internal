import { createLegacyKey, createLegacyObservableKey } from "./factories";
import { Key as KeyInterface } from "./implementation";
import { LegacyKeySchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export { UsableKeySchema, PendingRecoveryKeySchema } from "./schema";
export * from "./types";
export type LegacyKey = KeyInterface;

export { KeySchema, LegacyKeySchema } from "./schema";

export const LegacyKey = {
  schema: LegacyKeySchema,
  create: createLegacyKey,
} satisfies AbstractDataStructure<LegacyKey, typeof LegacyKeySchema>;

export const LegacyObservableKey = {
  schema: LegacyKeySchema,
  create: createLegacyObservableKey,
} satisfies AbstractDataStructure<LegacyKey, typeof LegacyKeySchema>;
