import { makeObservable, observable } from "mobx";

import { FlexAccount } from "./implementation";
import { FlexAccountInterface } from "./interface";
import { FlexAccountSchema } from "./schema";
import { AbstractMigratable } from "../migratable";

export function createFlexAccount(
  migratable: AbstractMigratable<typeof FlexAccountSchema>
): FlexAccountInterface {
  const serialized = FlexAccountSchema.migratableSchema.parse(migratable);
  return new FlexAccount(
    serialized.meta,
    serialized.address,
    serialized.publicKey,
    serialized.privateKey,
    serialized.spendLimit,
    serialized.autoSign
  );
}

export function createObservableFlexAccount(
  migratable: AbstractMigratable<typeof FlexAccountSchema>
): FlexAccountInterface {
  const flexAccount = createFlexAccount(migratable);
  makeObservable<
    FlexAccountInterface,
    | "_meta"
    | "_address"
    | "_publicKey"
    | "_privateKey"
    | "_spendLimit"
    | "_autoSign"
  >(
    flexAccount,
    {
      _meta: observable,
      _address: observable,
      _publicKey: observable,
      _privateKey: observable,
      _spendLimit: observable,
      _autoSign: observable,
      toJSON: false,
    },
    {
      name: "FlexAccount",
    }
  );
  return flexAccount;
}
