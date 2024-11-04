import { createMultisigKey, createObservableMultisigKey } from "./factories";
import { MultisigKey as MultisigKeyInterface } from "./implementation";
import { MultisigKeySchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export { LegacyMultisigKeySchema, MultisigKeySchema } from "./schema";

export type MultisigKey = MultisigKeyInterface;

export const MultisigKey = {
  schema: MultisigKeySchema,
  create: createMultisigKey,
} satisfies AbstractDataStructure<MultisigKey, typeof MultisigKeySchema>;

export const ObservableMultisigKey = {
  schema: MultisigKeySchema,
  create: createObservableMultisigKey,
} satisfies AbstractDataStructure<MultisigKey, typeof MultisigKeySchema>;
