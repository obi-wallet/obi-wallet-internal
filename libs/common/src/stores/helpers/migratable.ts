import * as t from "io-ts";

export interface Migratable<
  AnyVersion extends t.Any,
  CurrentVersion extends t.Any
> {
  anyVersion: AnyVersion;
  currentVersion: CurrentVersion;
  migrate: (data: t.TypeOf<AnyVersion>) => t.TypeOf<CurrentVersion>;
  addMigration: <NextVersion extends t.Any>({
    nextVersion,
    migrate,
  }: {
    nextVersion: NextVersion;
    migrate: (data: t.TypeOf<CurrentVersion>) => t.TypeOf<NextVersion>;
  }) => Migratable<t.UnionC<[AnyVersion, NextVersion]>, NextVersion>;
}

export function migratable<T extends t.Any>(type: T): Migratable<T, T> {
  return genericMigratable({
    anyVersion: type,
    currentVersion: type,
    migrate: (data) => data,
  });

  function genericMigratable<
    AnyVersion extends t.Any,
    CurrentVersion extends t.Any
  >({
    anyVersion,
    currentVersion,
    migrate,
  }: {
    anyVersion: AnyVersion;
    currentVersion: CurrentVersion;
    migrate: (data: t.TypeOf<AnyVersion>) => t.TypeOf<CurrentVersion>;
  }): Migratable<AnyVersion, CurrentVersion> {
    const previousMigrate = migrate;

    return {
      anyVersion,
      currentVersion,
      migrate,
      addMigration: <NextVersion extends t.Any>({
        nextVersion,
        migrate,
      }: {
        nextVersion: NextVersion;
        migrate: (data: t.TypeOf<CurrentVersion>) => t.TypeOf<NextVersion>;
      }) => {
        return genericMigratable<
          t.UnionC<[AnyVersion, NextVersion]>,
          NextVersion
        >({
          anyVersion: t.union([anyVersion, nextVersion]),
          currentVersion: nextVersion,
          migrate(data) {
            if (nextVersion.is(data)) return data;
            if (currentVersion.is(data)) return migrate(data);
            return migrate(previousMigrate(data));
          },
        });
      },
    };
  }
}
