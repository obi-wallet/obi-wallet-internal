import { z } from "zod";

import { ArrayIndex } from "../array-index";
import { migratable } from "../migratable";
import { MultisigWallet } from "../multisig-wallet";

export const WalletsSchema = migratable(
  z.object({
    currentWalletIndex: ArrayIndex.nullable(),
    wallets: z.array(MultisigWallet.schema.migratableSchema),
  })
);
