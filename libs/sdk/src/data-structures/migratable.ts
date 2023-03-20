import { z } from "zod";

/**
 * Creates a migratable schema with the given base schema. A migratable schema consists of:
 * - `currentSchema`: validates that the data confirms to the current version.
 * - `migratableSchema`: migrates the data to the current version.
 * - `addMigration`: adds another version to the migratable schema.
 *
 * @param schema - The base schema to create a migratable schema for.
 * @returns The migratable schema.
 */
export function migratable<T extends z.ZodTypeAny>(schema: T) {
  return createMigratableSchema({
    anyVersion: schema,
    currentVersion: schema,
    migrate: (data) => data,
  });
}

function createMigratableSchema<
  Any extends z.ZodTypeAny,
  Current extends z.ZodTypeAny
>({
  anyVersion,
  currentVersion,
  migrate,
}: {
  anyVersion: Any;
  currentVersion: Current;
  migrate: (data: z.infer<Any>) => z.infer<Current>;
}) {
  const previousMigrate = migrate;

  return {
    currentSchema: currentVersion,
    migratableSchema: anyVersion.transform(migrate),
    addMigration: <Next extends z.ZodTypeAny>({
      nextSchema,
      migrate,
    }: {
      nextSchema: Next;
      migrate: (data: z.infer<Current>) => z.infer<Next>;
    }) => {
      return createMigratableSchema<z.ZodUnion<[Next, Any]>, Next>({
        // Order is important here. We need to check `nextSchema` first,
        // ensuring the data is interpreted as the most recent version possible.
        anyVersion: nextSchema.or(anyVersion),
        currentVersion: nextSchema,
        migrate(data) {
          if (nextSchema.safeParse(data).success) return data;
          if (currentVersion.safeParse(data).success) return migrate(data);
          return migrate(previousMigrate(data));
        },
      });
    },
  };
}

export type AbstractMigratableSchema = ReturnType<
  typeof createMigratableSchema
>;

/**
 * Union type of all versions of the migratable data.
 */
export type AbstractMigratable<T extends AbstractMigratableSchema> = z.input<
  T["migratableSchema"]
>;
/**
 * The current version of the migratable data.
 */
export type AbstractSerialized<T extends AbstractMigratableSchema> = z.infer<
  T["currentSchema"]
>;
