import { action, makeObservable, observable, toJS } from "mobx";
import * as R from "ramda";

import { Beneficiary } from "./implementation";
import { BeneficiarySchema } from "./schema";
import { AbstractMigratable } from "../migratable";

export function createBeneficiary(
  migratable: AbstractMigratable<typeof BeneficiarySchema>,
  serialize = R.identity
) {
  const serialized = BeneficiarySchema.migratableSchema.parse(migratable);
  return new Beneficiary(
    serialized.meta,
    serialized.address,
    serialized.dormancyThreshold,
    serialized.dripSchedule,
    serialize
  );
}

export function createObservableBeneficiary(
  migratable: AbstractMigratable<typeof BeneficiarySchema>
) {
  const beneficiary = createBeneficiary(migratable, toJS);
  makeObservable<
    Beneficiary,
    "_meta" | "_address" | "_dormancyThreshold" | "_dripSchedule"
  >(
    beneficiary,
    {
      _meta: observable,
      _address: observable,
      _dormancyThreshold: observable,
      _dripSchedule: observable,
      toJSON: false,
      setDormancyThreshold: action,
      setDripRate: action,
      setDripPeriod: action,
    },
    {
      name: "Beneficiary",
    }
  );
  return beneficiary;
}
