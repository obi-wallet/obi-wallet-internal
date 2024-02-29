import { z } from "zod";

import { HomeChainIdSchema } from "../home-chain-id";
import { migratable } from "../migratable";
import { MultisigKey } from "../multisig-key";

export const UserEntryAddress = z.string().brand("UserEntryAddress");

export const MpcWalletSchema = migratable(
  z.object({
    homeChain: HomeChainIdSchema,
    owner: MultisigKey.schema.migratableSchema,
    userEntryAddress: UserEntryAddress,
    encryptedShares: z.object({
      easy: z.string().optional(),
      backup: z.string(),
    }),
  }),
);
