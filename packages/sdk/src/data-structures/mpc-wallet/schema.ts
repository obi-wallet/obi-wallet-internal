import { z } from "zod";

import { HomeChainIdSchema } from "../home-chain-id";
import { migratable } from "../migratable";
import { MultisigKey } from "../multisig-key";

export const UserEntryAddress = z.string().brand("UserEntryAddress");

// TODO:
export const MpcWalletSchema = migratable(
  z.object({
    homeChain: HomeChainIdSchema,
    owner: MultisigKey.schema.migratableSchema,
    userEntryAddress: UserEntryAddress,
    // TODO: shares encrypted
    // easy share (i.e., userShareForContract, userShareForBackup; encrypted by primary key)
    // backup share (i.e. backupShare; see distribute-shares/route.ts; encrypted by owner)
  }),
);
