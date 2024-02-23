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
export function migratable<T extends z.ZodTypeAny>(
  schema: T,
): AbstractMigratableSchema<T, T> {
  return createMigratableSchema({
    anyVersion: schema,
    currentVersion: schema,
    migrate: (data) => data,
  });
}

export type AbstractMigratableSchema<
  Any extends z.ZodTypeAny,
  Current extends z.ZodTypeAny,
> = {
  currentSchema: Current;
  migratableSchema: z.ZodEffects<Any, z.TypeOf<Current>, z.input<Any>>;
  addMigration: <Next extends z.ZodTypeAny>({
    nextSchema,
    migrate,
  }: {
    nextSchema: Next;
    migrate: (data: z.infer<Current>) => z.infer<Next>;
  }) => AbstractMigratableSchema<z.ZodUnion<[Next, Any]>, Next>;
};

function createMigratableSchema<
  Any extends z.ZodTypeAny,
  Current extends z.ZodTypeAny,
>({
  anyVersion,
  currentVersion,
  migrate,
}: {
  anyVersion: Any;
  currentVersion: Current;
  migrate: (data: z.infer<Any>) => z.infer<Current>;
}): AbstractMigratableSchema<Any, Current> {
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

/**
 * Union type of all versions of the migratable data.
 */
export type AbstractMigratable<T> =
  T extends AbstractMigratableSchema<infer Any, infer _Current>
    ? z.input<Any>
    : never;

/**
 * The current version of the migratable data.
 */
export type AbstractSerialized<T> =
  T extends AbstractMigratableSchema<infer _Any, infer Current>
    ? z.input<Current>
    : never;
