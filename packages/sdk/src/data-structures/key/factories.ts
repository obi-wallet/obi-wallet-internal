import { action, makeObservable, observable, toJS } from "mobx";
import * as R from "ramda";

import { Key, PendingRecoveryKey, UsableKey } from "./implementation";
import {
  LegacyKeySchema,
  PendingRecoveryKeySchema,
  UsableKeySchema,
} from "./schema";
import { AbstractMigratable } from "../migratable";

export function createKey(
  serialized: AbstractMigratable<typeof LegacyKeySchema>,
  serialize = R.identity,
) {
  const result =
    PendingRecoveryKeySchema.migratableSchema.safeParse(serialized);
  if (result.success) return new PendingRecoveryKey(result.data, serialize);
  return new UsableKey(
    UsableKeySchema.migratableSchema.parse(serialized),
    serialize,
  );
}

export function createObservableKey(
  serialized: AbstractMigratable<typeof LegacyKeySchema>,
) {
  const key = createKey(serialized, toJS);
  makeObservable<Key, "serialized">(
    key,
    {
      serialized: observable,
      toJSON: false,
      setSerialized: action,
    },
    {
      name: "Key",
    },
  );
  return key;
}
