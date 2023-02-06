import * as t from "io-ts";

import { migratable } from "../../helpers";

export const MigratableCosmosSinglesigWalletType = migratable(
  t.literal("singlesig")
).addMigration({
  nextVersion: t.literal("cosmos-singlesig"),
  migrate() {
    return "cosmos-singlesig" as const;
  },
});

export const MigratableCosmosSinglesigWallet = migratable(
  t.type({
    type: MigratableCosmosSinglesigWalletType.anyVersion,
    data: t.string,
  })
).addMigration({
  nextVersion: t.type({
    type: MigratableCosmosSinglesigWalletType.currentVersion,
    data: t.string,
  }),
  migrate(data) {
    return {
      type: MigratableCosmosSinglesigWalletType.migrate(data.type),
      data: data.data,
    };
  },
});
