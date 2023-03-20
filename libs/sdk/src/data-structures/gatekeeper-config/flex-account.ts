import { z } from "zod";

import { AccountMetaData } from "./account-meta-data";
import { Secp256k1PublicKey } from "../../keys";
import { Duration } from "../duration";
import { migratable } from "../migratable";

export const SpendLimit = z.object({
  amount: z.number(),
  period: Duration,
});

export const AutoSign = z.object({
  endTime: z.string().datetime({ offset: true }),
});

export const FlexAccount = migratable(
  z.object({
    type: z.literal("flex-account"),
    meta: AccountMetaData,
    address: z.string(),
    publicKey: Secp256k1PublicKey,
    privateKey: z.string(),
    spendLimit: SpendLimit.nullable(),
    autoSign: AutoSign.nullable(),
  })
);
