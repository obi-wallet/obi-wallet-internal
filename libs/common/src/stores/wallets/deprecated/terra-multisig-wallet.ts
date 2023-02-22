import { z } from "zod";

import { migratable } from "../../helpers";
import { MultisigKey } from "../multisig-key";
import {
  MigratableSerializedMultisigDemoWallet,
  MigratableSerializedMultisigWallet,
  MigratableSerializedMultisigWalletData,
} from "../multisig-wallet/serialized-data";

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
  nextSchema: MigratableSerializedMultisigWallet.schema.nullable(),
  migrate(data) {
    const multisigWalletData = migrateSerializedData(data.data);
    if (multisigWalletData) {
      return {
        type: "multisig" as const,
        data: multisigWalletData,
      };
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
  nextSchema: MigratableSerializedMultisigDemoWallet.schema.nullable(),
  migrate(data) {
    const multisigWalletData = migrateSerializedData(data.data);
    if (multisigWalletData) {
      return {
        type: "multisig-demo" as const,
        data: multisigWalletData,
      };
    }
    return null;
  },
});

export function migrateSerializedData(
  serializedData: SerializedTerraMultisigWalletData
): z.input<typeof MigratableSerializedMultisigWalletData.schema> | null {
  const result = SerializedTerraMultisigWalletData.safeParse(serializedData);
  if (result.success) {
    const proxyAddress = result.data.proxyAddress;
    const currentAdmin = result.data.currentAdmin;
    if (!proxyAddress || !currentAdmin) return null;

    const multisigKey = new MultisigKey({ chain: result.data.chain });
    if (currentAdmin.biometrics) {
      multisigKey.setDeviceKey(currentAdmin.biometrics);
    }
    if (currentAdmin.phoneNumber) {
      multisigKey.setPhoneKey(currentAdmin.phoneNumber);
    }
    if (currentAdmin.social) {
      multisigKey.setSocialKey(currentAdmin.social);
    }

    return {
      chain: result.data.chain,
      owner: multisigKey.serialize(),
      proxyAddress,
    };
  }

  return null;
}
