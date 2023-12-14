import { z } from "zod";

import {
  AbstractMigratable,
  AbstractSerialized,
  migratable,
} from "../../src/data-structures/migratable";

const UserSchemaV1 = z.object({
  name: z.string(),
});

const UserSchemaV2 = z.object({
  name: z.string(),
  email: z.string().email().nullable(),
});

const UserSchemaV3 = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nullable(),
});

const migratableSchemaV1 = migratable(UserSchemaV1);
const migratableSchemaV2 = migratableSchemaV1.addMigration({
  nextSchema: UserSchemaV2,
  migrate: (data) => ({
    ...data,
    email: null,
  }),
});
const migratableSchemaV3 = migratableSchemaV2.addMigration({
  nextSchema: UserSchemaV3,
  migrate: (data) => {
    const [firstName, lastName] = data.name.split(" ");
    return {
      firstName,
      lastName,
      email: data.email,
    };
  },
});

// The `satisfies` statements serve as unit tests for the type helpers
const userDataV1 = {
  name: "John Doe",
} satisfies AbstractSerialized<typeof migratableSchemaV1> &
  AbstractMigratable<typeof migratableSchemaV1> &
  AbstractMigratable<typeof migratableSchemaV2> &
  AbstractMigratable<typeof migratableSchemaV3>;
const userDataV2 = {
  name: "John Doe",
  email: "john.doe@example.com",
} satisfies AbstractSerialized<typeof migratableSchemaV2> &
  AbstractMigratable<typeof migratableSchemaV2> &
  AbstractMigratable<typeof migratableSchemaV3>;
const userDataV3 = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
} satisfies AbstractSerialized<typeof migratableSchemaV3> &
  AbstractMigratable<typeof migratableSchemaV3>;

describe("migratable", () => {
  it("should create a migratable schema", () => {
    expect(migratableSchemaV1.currentSchema).toBe(UserSchemaV1);
    expect(migratableSchemaV1.migratableSchema).toBeDefined();
  });

  it("should add a migration to the migratable schema", () => {
    expect(migratableSchemaV2.currentSchema).toBe(UserSchemaV2);
    expect(migratableSchemaV2.migratableSchema).toBeDefined();
  });

  it("should apply migrations to the data", () => {
    expect(migratableSchemaV1.migratableSchema.parse(userDataV1)).toEqual(
      userDataV1,
    );

    expect(migratableSchemaV2.migratableSchema.parse(userDataV1)).toEqual({
      ...userDataV2,
      email: null,
    });
    expect(migratableSchemaV2.migratableSchema.parse(userDataV2)).toEqual(
      userDataV2,
    );

    expect(migratableSchemaV3.migratableSchema.parse(userDataV1)).toEqual({
      ...userDataV3,
      email: null,
    });
    expect(migratableSchemaV3.migratableSchema.parse(userDataV2)).toEqual(
      userDataV3,
    );
    expect(migratableSchemaV3.migratableSchema.parse(userDataV3)).toEqual(
      userDataV3,
    );
  });
});
