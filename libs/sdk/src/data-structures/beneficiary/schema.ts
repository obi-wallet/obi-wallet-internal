import { z } from "zod";

import { Duration } from "../duration";
import { AccountMetaData } from "../gatekeeper-config/account-meta-data";
import { migratable } from "../migratable";
import { Percentage } from "../percentage";

export const BeneficiarySchema = migratable(
  z.object({
    type: z.literal("beneficiary"),
    meta: AccountMetaData.migratableSchema,
    address: z.string(),
    dormancyThreshold: Duration,
    dripSchedule: z.object({
      rate: Percentage,
      period: Duration,
    }),
  })
);
