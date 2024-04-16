import { HomeChainIdSchema } from "@obi-wallet/sdk";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

// LEGACY

export const WalletData = z.object({
  proxyAddress: z.object({
    address: z.string(),
  }),
  owner: z.object({
    threshold: z.string(),
    keys: z.array(
      z.object({
        type: z.string(),
        publicKey: Secp256k1PublicKey,
      }),
    ),
  }),
  encryptedBackupShare: z.string(),
  encryptedEasyShare: z.string().optional(),
  encryptedKeyMetaData: z.string().optional(),
});

export type WalletData = z.infer<typeof WalletData>;

export const WalletDataBackup = z.object({
  chainId: HomeChainIdSchema,
  proxyWallet: WalletData,
});

export type WalletDataBackup = z.infer<typeof WalletDataBackup>;

// NEW

export const NewWalletData = z.object({
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
});

export type NewWalletData = z.infer<typeof NewWalletData>;
