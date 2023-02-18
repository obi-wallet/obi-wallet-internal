import * as t from "io-ts";

import {
  MigratableSerializedCosmosMultisigDemoWallet,
  MigratableSerializedCosmosMultisigWallet,
} from "./deprecated/cosmos-multisig-wallet";
import { MigratableCosmosSinglesigWallet } from "./deprecated/cosmos-singlesig-wallet";
import {
  MigratableSerializedTerraMultisigDemoWallet,
  MigratableSerializedTerraMultisigWallet,
} from "./deprecated/terra-multisig-wallet";
import {
  MigratableSerializedMultisigDemoWallet,
  MigratableSerializedMultisigWallet,
} from "./multisig-wallet/serialized-data";
import { ArrayIndex, Migratable, migratable, nullable } from "../helpers";

export const SerializedWallet = t.union([
  MigratableSerializedMultisigWallet.currentVersion,
  MigratableSerializedMultisigDemoWallet.currentVersion,
]);
export type SerializedWallet = t.TypeOf<typeof SerializedWallet>;

export const MigratableSerializedData = migratable(
  t.type({
    currentWalletIndex: nullable(ArrayIndex),
    wallets: t.array(
      t.union([
        MigratableSerializedTerraMultisigWallet.anyVersion,
        MigratableSerializedTerraMultisigDemoWallet.anyVersion,
        MigratableSerializedCosmosMultisigWallet.anyVersion,
        MigratableSerializedCosmosMultisigDemoWallet.anyVersion,
        MigratableCosmosSinglesigWallet.anyVersion,
        MigratableSerializedMultisigWallet.anyVersion,
        MigratableSerializedMultisigDemoWallet.anyVersion,
      ])
    ),
  })
).addMigration({
  nextVersion: t.type({
    currentWalletIndex: nullable(ArrayIndex),
    wallets: t.array(SerializedWallet),
  }),
  migrate(data) {
    const wallets: SerializedWallet[] = [];

    data.wallets.forEach((wallet) => {
      if (handleType(MigratableSerializedTerraMultisigWallet)) return;
      if (handleType(MigratableSerializedTerraMultisigDemoWallet)) return;
      if (handleType(MigratableSerializedCosmosMultisigWallet)) return;
      if (handleType(MigratableSerializedCosmosMultisigDemoWallet)) return;
      if (handleType(MigratableSerializedMultisigWallet)) return;
      if (handleType(MigratableSerializedMultisigDemoWallet)) return;

      function handleType<
        AnyVersion extends t.Any,
        CurrentVersion extends t.Any
      >(type: Migratable<AnyVersion, CurrentVersion>) {
        if (type.anyVersion.is(wallet)) {
          const migratedWallet = type.migrate(wallet);
          if (migratedWallet) {
            wallets.push(migratedWallet);
          }
          return true;
        }
        return false;
      }
    });

    return {
      ...data,
      wallets,
    };
  },
});

export type SerializedData = t.TypeOf<
  typeof MigratableSerializedData.currentVersion
>;
