import { z } from "zod";

import { ArrayIndex } from "../array-index";
import { migratable } from "../migratable";
import { MpcWallet } from "../mpc-wallet";

export const MpcWalletsSchema = migratable(
  z.object({
    currentWalletIndex: ArrayIndex.nullable(),
    wallets: z.array(MpcWallet.schema.migratableSchema),
  }),
);
