import {
  AbstractMigratable,
  AbstractMigratableSchema,
  AbstractSerialized,
} from "./migratable";

export interface AttachedSchema {
  schema: AbstractMigratableSchema;
}

export interface AbstractDataStructure<T> extends AttachedSchema {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (...args: any[]) => T;
}

export type AbstractDataStructureToSchema<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends AttachedSchema ? T["schema"] : never;
export type Migratable<T> = AbstractMigratable<
  AbstractDataStructureToSchema<T>
>;
export type Serialized<T> = AbstractSerialized<
  AbstractDataStructureToSchema<T>
>;
