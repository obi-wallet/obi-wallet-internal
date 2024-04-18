import { z } from "zod";

import { Secp256k1PublicKey } from "../../keys";
import { HomeChainIdSchema } from "../home-chain-id";
import { migratable } from "../migratable";
import { MultisigKey } from "../multisig-key";

export const UserEntryAddress = z.string().brand("UserEntryAddress");

export const WalletData = z.object({
  homeChainId: HomeChainIdSchema,
  userEntryAddress: z.string(),
  owner: z.object({
    threshold: z.string(),
    keys: z.array(
      z.object({
        type: z.string(),
        publicKey: Secp256k1PublicKey,
      }),
    ),
  }),
  encryptedShares: z.object({
    easy: z.string(),
    backup: z.string(),
  }),
  encryptedKeyMetaData: z.string(),
  revision: z.number().default(0),
});

export type WalletData = z.infer<typeof WalletData>;

export const MpcWalletSchema = migratable(
  z.object({
    homeChain: HomeChainIdSchema,
    owner: MultisigKey.schema.migratableSchema,
    userEntryAddress: UserEntryAddress,
    encryptedShares: z.object({
      easy: z.string(),
      backup: z.string(),
    }),
  }),
).addMigration({
  nextSchema: z.object({
    homeChain: HomeChainIdSchema,
    owner: MultisigKey.schema.migratableSchema,
    userEntryAddress: UserEntryAddress,
    encryptedShares: z.object({
      easy: z.string(),
      backup: z.string(),
    }),
    previousWalletData: WalletData.or(z.null()),
  }),
  migrate(data) {
    return {
      ...data,
      previousWalletData: null,
    };
  },
});
