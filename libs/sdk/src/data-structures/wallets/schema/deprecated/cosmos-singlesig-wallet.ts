import { z } from "zod";

import { migratable } from "../../../migratable";

const MigratableCosmosSinglesigWalletType = migratable(
  z.literal("singlesig")
).addMigration({
  nextSchema: z.literal("cosmos-singlesig"),
  migrate() {
    return "cosmos-singlesig" as const;
  },
});

const MigratableCosmosSinglesigWallet = migratable(
  z.object({
    type: MigratableCosmosSinglesigWalletType.migratableSchema,
    data: z.string(),
  })
);

export const DeprecatedCosmosSinglesigWallet = MigratableCosmosSinglesigWallet;
