import {
  KeyType,
  Migratable,
  MultisigKey,
  MultisigWallet,
} from "@obi-wallet/sdk";
import { z } from "zod";

import { migratable } from "../../helpers";

export const Secp256k1PublicKey = z.object({
  type: z.literal("tendermint/PubKeySecp256k1"),
  value: z.string(),
});
export const SerializedBiometricsPayload = z.object({
  publicKey: Secp256k1PublicKey,
});

export const SerializedPhoneNumberPayload = z.object({
  publicKey: Secp256k1PublicKey,
  phoneNumber: z.string(),
  securityQuestion: z.string(),
});

export const SerializedSocialPayload = z.object({
  publicKey: Secp256k1PublicKey,
});

export const SerializedMultisigPayload = z.object({
  biometrics: SerializedBiometricsPayload.nullable(),
  phoneNumber: SerializedPhoneNumberPayload.nullable(),
  social: SerializedSocialPayload.nullable(),
});

export const SerializedProxyAddress = z.object({
  address: z.string(),
  codeId: z.number().int().positive(),
});
export type SerializedProxyAddress = z.infer<typeof SerializedProxyAddress>;

export const TerraChain = z.union([
  z.literal("pisco-1"),
  z.literal("phoenix-1"),
]);

export const SerializedTerraMultisigWalletData = z.object({
  chain: TerraChain,
  nextAdmin: SerializedMultisigPayload,
  currentAdmin: SerializedMultisigPayload.nullable(),
  proxyAddress: SerializedProxyAddress.nullable(),
});

export type SerializedTerraMultisigWalletData = z.TypeOf<
  typeof SerializedTerraMultisigWalletData
>;

export const MigratableSerializedTerraMultisigWallet = migratable(
  z.object({
    type: z.literal("terra-multisig"),
    data: SerializedTerraMultisigWalletData,
  })
).addMigration({
  nextSchema: MultisigWallet.schema.currentSchema.nullable(),
  migrate(data) {
    const multisigWalletData = migrateSerializedData(data.data);
    if (multisigWalletData) {
      return MultisigWallet.schema.migratableSchema.parse({
        type: "multisig" as const,
        data: multisigWalletData,
      });
    }
    return null;
  },
});

export const MigratableSerializedTerraMultisigDemoWallet = migratable(
  z.object({
    type: z.literal("terra-multisig-demo"),
    data: SerializedTerraMultisigWalletData,
  })
).addMigration({
  nextSchema: MultisigWallet.schema.currentSchema.nullable(),
  migrate(data) {
    const multisigWalletData = migrateSerializedData(data.data);
    if (multisigWalletData) {
      return MultisigWallet.schema.migratableSchema.parse({
        type: "multisig-demo" as const,
        data: multisigWalletData,
      });
    }
    return null;
  },
});

export function migrateSerializedData(
  serializedData: SerializedTerraMultisigWalletData
): Migratable<typeof MultisigWallet>["data"] | null {
  const result = SerializedTerraMultisigWalletData.safeParse(serializedData);
  if (result.success) {
    const proxyAddress = result.data.proxyAddress;
    const currentAdmin = result.data.currentAdmin;
    if (!proxyAddress || !currentAdmin) return null;

    return {
      chain: result.data.chain,
      owner: migrateMultisigKey(result.data).toJSON(),
      proxyAddress,
    };
  }

  return null;

  function migrateMultisigKey({
    chain,
    currentAdmin,
  }: SerializedTerraMultisigWalletData) {
    const result = MultisigKey.empty(chain);
    if (currentAdmin?.biometrics) {
      result.setKey({
        type: KeyType.Device,
        payload: currentAdmin.biometrics,
      });
    }
    if (currentAdmin?.phoneNumber) {
      result.setKey({
        type: KeyType.Phone,
        payload: currentAdmin.phoneNumber,
      });
    }
    if (currentAdmin?.social) {
      result.setKey({
        type: KeyType.Social,
        payload: currentAdmin.social,
      });
    }
    return result;
  }
}
