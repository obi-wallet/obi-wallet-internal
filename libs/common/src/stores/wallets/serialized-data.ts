import { MultisigKey, MultisigWallet, Serialized } from "@obi-wallet/sdk";
import { z } from "zod";

import {
  MigratableSerializedCosmosMultisigDemoWallet,
  MigratableSerializedCosmosMultisigWallet,
} from "./deprecated/cosmos-multisig-wallet";
import { MigratableCosmosSinglesigWallet } from "./deprecated/cosmos-singlesig-wallet";
import {
  MigratableSerializedTerraMultisigDemoWallet,
  MigratableSerializedTerraMultisigWallet,
} from "./deprecated/terra-multisig-wallet";
import { ArrayIndex, migratable } from "../helpers";

export const MigratableSerializedData = migratable(
  z.object({
    currentWalletIndex: ArrayIndex.nullable(),
    wallets: z.array(
      z.union([
        MigratableSerializedTerraMultisigWallet.schema,
        MigratableSerializedTerraMultisigDemoWallet.schema,
        MigratableSerializedCosmosMultisigWallet.schema,
        MigratableSerializedCosmosMultisigDemoWallet.schema,
        MigratableCosmosSinglesigWallet.schema,
        MultisigKey.schema.migratableSchema,
      ])
    ),
  })
).addMigration({
  nextSchema: z.object({
    currentWalletIndex: ArrayIndex.nullable(),
    wallets: z.array(MultisigWallet.schema.migratableSchema),
  }),
  migrate(data) {
    const wallets: Serialized<MultisigWallet>[] = [];

    data.wallets.forEach((wallet) => {
      if (handleType(MigratableSerializedTerraMultisigWallet.schema)) return;
      if (handleType(MigratableSerializedTerraMultisigDemoWallet.schema))
        return;
      if (handleType(MigratableSerializedCosmosMultisigWallet.schema)) return;
      if (handleType(MigratableSerializedCosmosMultisigDemoWallet.schema))
        return;
      if (handleType(MultisigWallet.schema.migratableSchema)) return;

      function handleType<T extends z.ZodTypeAny>(type: T) {
        const result = type.safeParse(wallet);
        if (result.success && result.data) {
          wallets.push(result.data);
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

export type SerializedData = z.infer<typeof MigratableSerializedData.schema>;
