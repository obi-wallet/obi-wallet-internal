import { createBeneficiary, createObservableBeneficiary } from "./factories";
import { BeneficiaryInterface } from "./interface";
import { BeneficiarySchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export type Beneficiary = BeneficiaryInterface;

export const Beneficiary = {
  schema: BeneficiarySchema,
  create: createBeneficiary,
} satisfies AbstractDataStructure<Beneficiary>;

export const ObservableBeneficiary = {
  schema: BeneficiarySchema,
  create: createObservableBeneficiary,
} satisfies AbstractDataStructure<Beneficiary>;
