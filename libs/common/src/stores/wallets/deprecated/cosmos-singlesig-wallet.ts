import { z } from "zod";

import { migratable } from "../../helpers";

export const MigratableCosmosSinglesigWalletType = migratable(
  z.literal("singlesig")
).addMigration({
  nextSchema: z.literal("cosmos-singlesig"),
  migrate() {
    return "cosmos-singlesig" as const;
  },
});

export const MigratableCosmosSinglesigWallet = migratable(
  z.object({
    type: MigratableCosmosSinglesigWalletType.schema,
    data: z.string(),
  })
);
