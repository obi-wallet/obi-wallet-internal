import { z } from "zod";

import { ArrayIndex } from "../array-index";
import { ChainIdSchema } from "../chain-id";
import { migratable } from "../migratable";
import { MultisigWallet } from "../multisig-wallet";

export const WalletsSchema = migratable(
  z.object({
    currentWalletIndex: ArrayIndex.nullable(),
    wallets: z.array(MultisigWallet.schema.migratableSchema),
  })
).addMigration({
  nextSchema: z.object({
    currentChainId: ChainIdSchema.nullable(),
    currentWalletIndexPerChain: z.record(ChainIdSchema, ArrayIndex.nullable()),
    wallets: z.array(MultisigWallet.schema.migratableSchema),
  }),
  migrate(data) {
    const currentWallet = data.currentWalletIndex
      ? data.wallets[data.currentWalletIndex]
      : null;
    const currentChainId = currentWallet?.data?.chain ?? null;
    const currentWalletIndexPerChain = currentChainId
      ? {
          [currentChainId]: data.currentWalletIndex,
        }
      : {};

    return {
      ...data,
      currentChainId,
      currentWalletIndexPerChain,
    };
  },
});
