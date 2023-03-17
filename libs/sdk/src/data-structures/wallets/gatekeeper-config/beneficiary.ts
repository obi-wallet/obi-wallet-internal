import { z } from "zod";

import { AccountMetaData } from "./account-meta-data";
import { Duration } from "../../duration";
import { migratable } from "../../migratable";
import { Percentage } from "../../percentage";

export const Beneficiary = migratable(
  z.object({
    type: z.literal("beneficiary"),
    meta: AccountMetaData,
    address: z.string(),
    dormancyThreshold: Duration,
    dripSchedule: z.object({
      rate: Percentage,
      period: Duration,
    }),
  })
);
