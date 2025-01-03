import { Base58EncodedString, Base64EncodedString } from "@obi-wallet/encoding";
import { z } from "zod";

import { Secp256k1PublicKey } from "../../keys";
import {
  MultisigKeyEncryptedData,
  PrimaryKeyEncryptedData,
  Secp256k1EncryptedData,
} from "../../schemas";
import { HomeChainIdSchema } from "../home-chain-id";
import { migratable } from "../migratable";
import { LegacyMultisigKeySchema, MultisigKeySchema } from "../multisig-key";

export const EncryptedEasyShareForClient = PrimaryKeyEncryptedData.brand(
  "EncryptedEasyShareForClient",
);
export type EncryptedEasyShareForClient = z.infer<
  typeof EncryptedEasyShareForClient
>;

export const EncryptedEasyShareForBackup = MultisigKeyEncryptedData.brand(
  "EncryptedEasyShareForBackup",
);
export type EncryptedEasyShareForBackup = z.infer<
  typeof EncryptedEasyShareForBackup
>;

export const EncryptedBackupShare = MultisigKeyEncryptedData.brand(
  "EncryptedBackupShare",
);
export type EncryptedBackupShare = z.infer<typeof EncryptedBackupShare>;

export const EncryptedNetworkShare = MultisigKeyEncryptedData.brand(
  "EncryptedNetworkShare",
);
export type EncryptedNetworkShare = z.infer<typeof EncryptedNetworkShare>;

export const UserEntryAddress = z.string().brand("UserEntryAddress");
export type UserEntryAddress = z.infer<typeof UserEntryAddress>;

export const WalletData = z.object({
  homeChainId: HomeChainIdSchema,
  userEntryAddress: UserEntryAddress,
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
    easy: EncryptedEasyShareForBackup,
    backup: EncryptedBackupShare,
  }),
  encryptedKeyMetaData: MultisigKeyEncryptedData,
  ed25519KeyPair: z
    .object({
      publicKey: Base58EncodedString,
      encryptedPrivateKey: MultisigKeyEncryptedData,
    })
    .optional(),
  revision: z.number().default(0),
});

export type WalletData = z.infer<typeof WalletData>;

export const LegacyMpcWalletSchema = migratable(
  z.object({
    homeChain: HomeChainIdSchema,
    owner: LegacyMultisigKeySchema.migratableSchema,
    userEntryAddress: UserEntryAddress,
    encryptedShares: z.object({
      easy: Secp256k1EncryptedData,
      backup: EncryptedBackupShare,
    }),
  }),
)
  .addMigration({
    nextSchema: z.object({
      homeChain: HomeChainIdSchema,
      owner: LegacyMultisigKeySchema.migratableSchema,
      userEntryAddress: UserEntryAddress,
      encryptedShares: z.object({
        easy: Secp256k1EncryptedData,
        backup: EncryptedBackupShare,
      }),
      previousWalletData: WalletData.nullable(),
    }),
    migrate(data) {
      return {
        ...data,
        previousWalletData: null,
      };
    },
  })
  .addMigration({
    nextSchema: z.object({
      homeChain: HomeChainIdSchema,
      owner: LegacyMultisigKeySchema.migratableSchema,
      userEntryAddress: UserEntryAddress,
      encryptedShares: z.object({
        easy: Secp256k1EncryptedData,
        backup: EncryptedBackupShare,
      }),
      ed25519KeyPair: z
        .object({
          publicKey: Base58EncodedString,
          encryptedPrivateKey: MultisigKeyEncryptedData,
        })
        .nullable(),
      previousWalletData: WalletData.nullable(),
    }),
    migrate(data) {
      return {
        ...data,
        ed25519KeyPair: null,
      };
    },
  });

export const LocalMpcWalletSchema = z.object({
  homeChain: HomeChainIdSchema,
  owner: MultisigKeySchema,
  userEntryAddress: z.null(),
  encryptedShares: z.object({
    easy: EncryptedEasyShareForClient,
    backup: EncryptedBackupShare,
    network: EncryptedNetworkShare,
  }),
  secp256k1KeyPair: z.object({
    publicKey: Base64EncodedString,
    // TODO: here we want the encrypted shares
  }),
  ed25519KeyPair: z
    .object({
      publicKey: Base58EncodedString,
      encryptedPrivateKey: MultisigKeyEncryptedData,
    })
    .nullable(),
  previousWalletData: z.null(),
});

export const BackedUpMpcWalletSchema = z.object({
  homeChain: HomeChainIdSchema,
  owner: MultisigKeySchema,
  userEntryAddress: UserEntryAddress,
  encryptedShares: z.object({
    easy: EncryptedEasyShareForClient,
    backup: EncryptedBackupShare,
  }),
  secp256k1KeyPair: z
    .object({
      publicKey: Base64EncodedString.or(z.null()),
      // TODO: here we want the encrypted shares
    })
    .default({
      publicKey: null,
    }),
  ed25519KeyPair: z
    .object({
      publicKey: Base58EncodedString,
      encryptedPrivateKey: MultisigKeyEncryptedData,
    })
    .nullable(),
  previousWalletData: WalletData.nullable(),
});

export const MpcWalletSchema = z.union([
  LocalMpcWalletSchema,
  BackedUpMpcWalletSchema,
]);
