import { action, makeObservable, observable } from "mobx";

import { Beneficiary } from "./implementation";
import { BeneficiaryInterface } from "./interface";
import { BeneficiarySchema } from "./schema";
import { AbstractMigratable } from "../migratable";

export function createBeneficiary(
  migratable: AbstractMigratable<typeof BeneficiarySchema>
): BeneficiaryInterface {
  const serialized = BeneficiarySchema.migratableSchema.parse(migratable);
  return new Beneficiary(
    serialized.meta,
    serialized.address,
    serialized.dormancyThreshold,
    serialized.dripSchedule
  );
}

export function createObservableBeneficiary(
  migratable: AbstractMigratable<typeof BeneficiarySchema>
): BeneficiaryInterface {
  const beneficiary = createBeneficiary(migratable);
  makeObservable<
    BeneficiaryInterface,
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
