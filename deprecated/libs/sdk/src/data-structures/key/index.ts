import { createKey, createObservableKey } from "./factories";
import { Key as KeyInterface } from "./implementation";
import { KeySchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export * from "./types";
export type Key = KeyInterface;

export const Key = {
  schema: KeySchema,
  create: createKey,
} satisfies AbstractDataStructure<Key, typeof KeySchema>;

export const ObservableKey = {
  schema: KeySchema,
  create: createObservableKey,
} satisfies AbstractDataStructure<Key, typeof KeySchema>;
