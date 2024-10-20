import { createMultisigKey, createObservableMultisigKey } from "./factories";
import { MultisigKey as MultisigKeyInterface } from "./implementation";
import { LegacyMultisigKeySchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export { LegacyMultisigKeySchema, MultisigKeySchema } from "./schema";

export type MultisigKey = MultisigKeyInterface;

export const MultisigKey = {
  schema: LegacyMultisigKeySchema,
  create: createMultisigKey,
} satisfies AbstractDataStructure<MultisigKey, typeof LegacyMultisigKeySchema>;

export const ObservableMultisigKey = {
  schema: LegacyMultisigKeySchema,
  create: createObservableMultisigKey,
} satisfies AbstractDataStructure<MultisigKey, typeof LegacyMultisigKeySchema>;
