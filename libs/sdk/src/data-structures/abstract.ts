import { z } from "zod";

export interface AbstractMigratableSchema {
  currentSchema: z.ZodTypeAny;
  migratableSchema: z.ZodTypeAny;
}

export type AbstractMigratable<T extends AbstractMigratableSchema> = z.input<
  T["migratableSchema"]
>;
export type AbstractSerialized<T extends AbstractMigratableSchema> = z.infer<
  T["currentSchema"]
>;

export type MigratableSchema<T> = T extends { schema: AbstractMigratableSchema }
  ? T["schema"]
  : never;
export type Migratable<T> = AbstractMigratable<MigratableSchema<T>>;
export type Serialized<T> = AbstractSerialized<MigratableSchema<T>>;
