import { z } from "zod";

import { ArrayIndex } from "../array-index";
import { migratable } from "../migratable";
import { LegacyMpcWalletSchema, MpcWalletSchema } from "../mpc-wallet";

export const LegacyMpcWalletsSchema = migratable(
  z.object({
    currentWalletIndex: ArrayIndex.nullable(),
    wallets: z.array(LegacyMpcWalletSchema.migratableSchema),
  }),
);

export const MpcWalletsSchema = z.object({
  v: z.literal(1),
  currentWalletIndex: ArrayIndex.nullable(),
  wallets: z.array(MpcWalletSchema),
});
