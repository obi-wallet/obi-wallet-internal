import { AbstractMigratable, AbstractSerialized } from "./migratable";

export interface AbstractDataStructure<T, S> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (...args: any[]) => T;
  schema: S;
}

export type AbstractDataStructureToSchema<T> = T extends { schema: infer S }
  ? S
  : never;
export type Migratable<T> = AbstractMigratable<
  AbstractDataStructureToSchema<T>
>;
export type Serialized<T> = AbstractSerialized<
  AbstractDataStructureToSchema<T>
>;
