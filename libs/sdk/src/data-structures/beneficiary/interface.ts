import { z } from "zod";

import { BeneficiarySchema } from "./schema";
import { Duration } from "../duration";
import { AccountMetaData } from "../gatekeeper-config/account-meta-data";
import { AbstractSerialized } from "../migratable";

export interface BeneficiaryInterface {
  readonly schema: typeof BeneficiarySchema;
  readonly type: "beneficiary";
  readonly meta: AbstractSerialized<typeof AccountMetaData>;
  readonly address: string;
  readonly dormancyThreshold: z.infer<typeof Duration>;
  readonly dripSchedule: {
    rate: number;
    period: z.infer<typeof Duration>;
  };

  toJSON(): AbstractSerialized<typeof BeneficiarySchema>;
  equals(other: BeneficiaryInterface): boolean;
  setDormancyThreshold(duration: z.infer<typeof Duration>): void;
  setDripRate(rate: number): void;
  setDripPeriod(duration: z.infer<typeof Duration>): void;
}
