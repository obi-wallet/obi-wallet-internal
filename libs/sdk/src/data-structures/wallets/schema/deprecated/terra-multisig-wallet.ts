import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { Migratable } from "../../../abstract";
import { migratable } from "../../../migratable";
import { createMultisigKey, KeyType } from "../../../multisig-key";
import { MultisigWallet } from "../../../multisig-wallet";

const SerializedBiometricsPayload = z.object({
  publicKey: Secp256k1PublicKey,
});

const SerializedPhoneNumberPayload = z.object({
  publicKey: Secp256k1PublicKey,
  phoneNumber: z.string(),
  securityQuestion: z.string(),
});

const SerializedSocialPayload = z.object({
  publicKey: Secp256k1PublicKey,
});

const SerializedMultisigPayload = z.object({
  biometrics: SerializedBiometricsPayload.nullable(),
  phoneNumber: SerializedPhoneNumberPayload.nullable(),
  social: SerializedSocialPayload.nullable(),
});

const SerializedProxyAddress = z.object({
  address: z.string(),
  codeId: z.number().int().positive(),
});

const TerraChain = z.union([z.literal("pisco-1"), z.literal("phoenix-1")]);

const SerializedTerraMultisigWalletData = z.object({
  chain: TerraChain,
  nextAdmin: SerializedMultisigPayload,
  currentAdmin: SerializedMultisigPayload.nullable(),
  proxyAddress: SerializedProxyAddress.nullable(),
});

type SerializedTerraMultisigWalletData = z.TypeOf<
  typeof SerializedTerraMultisigWalletData
>;

const MigratableSerializedTerraMultisigWallet = migratable(
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

const MigratableSerializedTerraMultisigDemoWallet = migratable(
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

export const DeprecatedTerraMultisigWallet =
  MigratableSerializedTerraMultisigWallet;
export const DeprecatedTerraMultisigDemoWallet =
  MigratableSerializedTerraMultisigDemoWallet;

function migrateSerializedData(
  serializedData: SerializedTerraMultisigWalletData
): Migratable<MultisigWallet>["data"] | null {
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
    const result = createMultisigKey(chain);
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
