import { makeObservable, observable, toJS } from "mobx";
import * as R from "ramda";

import { Key, PendingRecoveryKey, UsableKey } from "./implementation";
import { KeySchema, PendingRecoveryKeySchema, UsableKeySchema } from "./schema";
import { AbstractMigratable } from "../migratable";

export function createKey(
  serialized: AbstractMigratable<typeof KeySchema>,
  serialize = R.identity
) {
  const result =
    PendingRecoveryKeySchema.migratableSchema.safeParse(serialized);
  if (result.success) return new PendingRecoveryKey(result.data, serialize);
  return new UsableKey(
    UsableKeySchema.migratableSchema.parse(serialized),
    serialize
  );
}

export function createObservableKey(
  serialized: AbstractMigratable<typeof KeySchema>
) {
  const key = createKey(serialized, toJS);
  makeObservable<Key, "serialized">(
    key,
    {
      serialized: observable,
      toJSON: false,
    },
    {
      name: "Key",
    }
  );
  return key;
}
