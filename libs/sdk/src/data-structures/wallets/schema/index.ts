import { z } from "zod";

import {
  DeprecatedCosmosMultisigDemoWallet,
  DeprecatedCosmosMultisigWallet,
} from "./deprecated/cosmos-multisig-wallet";
import { DeprecatedCosmosSinglesigWallet } from "./deprecated/cosmos-singlesig-wallet";
import {
  DeprecatedTerraMultisigDemoWallet,
  DeprecatedTerraMultisigWallet,
} from "./deprecated/terra-multisig-wallet";
import { Serialized } from "../../abstract";
import { ArrayIndex } from "../../array-index";
import { migratable } from "../../migratable";
import { MultisigWallet } from "../../multisig-wallet";

export const WalletsSchema = migratable(
  z.object({
    currentWalletIndex: ArrayIndex.nullable(),
    wallets: z.array(
      z.union([
        DeprecatedTerraMultisigWallet.migratableSchema,
        DeprecatedTerraMultisigDemoWallet.migratableSchema,
        DeprecatedCosmosMultisigWallet.migratableSchema,
        DeprecatedCosmosMultisigDemoWallet.migratableSchema,
        DeprecatedCosmosSinglesigWallet.migratableSchema,
        MultisigWallet.schema.migratableSchema,
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
      if (handleType(DeprecatedTerraMultisigWallet.migratableSchema)) return;
      if (handleType(DeprecatedTerraMultisigDemoWallet.migratableSchema))
        return;
      if (handleType(DeprecatedCosmosMultisigWallet.migratableSchema)) return;
      if (handleType(DeprecatedCosmosMultisigWallet.migratableSchema)) return;
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
