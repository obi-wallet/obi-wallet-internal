import { createMultisigKey, createObservableMultisigKey } from "./factories";
import { MultisigKey as MultisigKeyInterface } from "./implementation";
import { MultisigKeySchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export type MultisigKey = MultisigKeyInterface;

export const MultisigKey = {
  schema: MultisigKeySchema,
  create: createMultisigKey,
} satisfies AbstractDataStructure<MultisigKey>;

export const ObservableMultisigKey = {
  schema: MultisigKeySchema,
  create: createObservableMultisigKey,
} satisfies AbstractDataStructure<MultisigKey>;
