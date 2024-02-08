import { createBeneficiary, createObservableBeneficiary } from "./factories";
import { Beneficiary as BeneficiaryInterface } from "./implementation";
import { BeneficiarySchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export type Beneficiary = BeneficiaryInterface;

export const Beneficiary = {
  schema: BeneficiarySchema,
  create: createBeneficiary,
} satisfies AbstractDataStructure<Beneficiary, typeof BeneficiarySchema>;

export const ObservableBeneficiary = {
  schema: BeneficiarySchema,
  create: createObservableBeneficiary,
} satisfies AbstractDataStructure<Beneficiary, typeof BeneficiarySchema>;
