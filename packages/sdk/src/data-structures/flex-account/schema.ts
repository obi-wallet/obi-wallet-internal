import { z } from "zod";

import { Secp256k1PublicKey } from "../../keys";
import { Duration } from "../duration";
import { AccountMetaData } from "../gatekeeper-config/account-meta-data";
import { migratable } from "../migratable";

export const SpendLimit = z.object({
  amount: z.number(),
  period: Duration,
});

export const AutoSign = z.object({
  endTime: z.string().datetime({ offset: true }),
});

export const FlexAccountSchema = migratable(
  z.object({
    type: z.literal("flex-account"),
    meta: AccountMetaData.migratableSchema,
    address: z.string(),
    publicKey: Secp256k1PublicKey,
    privateKey: z.string(),
    spendLimit: SpendLimit.nullable(),
    autoSign: AutoSign.nullable(),
  }),
);
