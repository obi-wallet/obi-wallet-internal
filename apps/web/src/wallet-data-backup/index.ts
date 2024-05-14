import { HomeChainIdSchema } from "@obi-wallet/sdk";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

export const LegacyWalletData = z.object({
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

export type LegacyWalletData = z.infer<typeof LegacyWalletData>;

export const LegacyWalletDataBackup = z.object({
  chainId: HomeChainIdSchema,
  proxyWallet: LegacyWalletData,
});

export type LegacyWalletDataBackup = z.infer<typeof LegacyWalletDataBackup>;
