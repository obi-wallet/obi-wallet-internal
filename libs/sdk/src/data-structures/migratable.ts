import { z } from "zod";

export function migratable<T extends z.ZodTypeAny>(schema: T) {
  return genericMigratable({
    anyVersion: schema,
    currentVersion: schema,
    migrate: (data) => data,
  });

  function genericMigratable<
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
        return genericMigratable<z.ZodUnion<[Next, Any]>, Next>({
          // Order is important here. We want to check the next schema first
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
}

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
