import { z } from "zod";

import { migratable } from "../migratable";

export const WalletConnectSchema = migratable(
  z.record(
    z.object({
      session: z.unknown(),
      walletMeta: z.object({
        walletId: z.string(),
        currentAccount: z
          .object({
            type: z.union([
              z.literal("flex-account"),
              z.literal("singlesig-wallet"),
            ]),
            id: z.string(),
          })
          .nullable(),
      }),
    })
  )
);
