import * as t from "io-ts";

import { migratable, nullable } from "../../helpers";
import { MultisigKey } from "../multisig-key";
import {
  MigratableSerializedMultisigDemoWallet,
  MigratableSerializedMultisigWallet,
  MigratableSerializedMultisigWalletData,
} from "../multisig-wallet/serialized-data";

export const Secp256k1PublicKey = t.type({
  type: t.literal("tendermint/PubKeySecp256k1"),
  value: t.string,
});
export const SerializedBiometricsPayload = t.type({
  publicKey: Secp256k1PublicKey,
});

export const SerializedPhoneNumberPayload = t.type({
  publicKey: Secp256k1PublicKey,
  phoneNumber: t.string,
  securityQuestion: t.string,
});

export const SerializedSocialPayload = t.type({
  publicKey: Secp256k1PublicKey,
});

export const SerializedMultisigPayload = t.type({
  biometrics: nullable(SerializedBiometricsPayload),
  phoneNumber: nullable(SerializedPhoneNumberPayload),
  social: nullable(SerializedSocialPayload),
});

export const SerializedProxyAddress = t.type({
  address: t.string,
  codeId: t.number,
});
export type SerializedProxyAddress = t.TypeOf<typeof SerializedProxyAddress>;

export const TerraChain = t.union([
  t.literal("pisco-1"),
  t.literal("phoenix-1"),
]);

export const SerializedTerraMultisigWalletData = t.type({
  chain: TerraChain,
  nextAdmin: SerializedMultisigPayload,
  currentAdmin: nullable(SerializedMultisigPayload),
  proxyAddress: nullable(SerializedProxyAddress),
});

export type SerializedTerraMultisigWalletData = t.TypeOf<
  typeof SerializedTerraMultisigWalletData
>;

export const MigratableSerializedTerraMultisigWallet = migratable(
  t.type({
    type: t.literal("terra-multisig"),
    data: SerializedTerraMultisigWalletData,
  })
).addMigration({
  nextVersion: nullable(MigratableSerializedMultisigWallet.currentVersion),
  migrate(data) {
    const multisigWalletData = migrateSerializedData(data.data);
    if (multisigWalletData) {
      return MigratableSerializedMultisigWallet.migrate({
        type: "multisig",
        data: multisigWalletData,
      });
    }
    return null;
  },
});

export const MigratableSerializedTerraMultisigDemoWallet = migratable(
  t.type({
    type: t.literal("terra-multisig-demo"),
    data: SerializedTerraMultisigWalletData,
  })
).addMigration({
  nextVersion: nullable(MigratableSerializedMultisigDemoWallet.currentVersion),
  migrate(data) {
    const multisigWalletData = migrateSerializedData(data.data);
    if (multisigWalletData) {
      return MigratableSerializedMultisigDemoWallet.migrate({
        type: "multisig-demo",
        data: multisigWalletData,
      });
    }
    return null;
  },
});

export function migrateSerializedData(
  serializedData: SerializedTerraMultisigWalletData
): t.TypeOf<typeof MigratableSerializedMultisigWalletData.anyVersion> | null {
  if (SerializedTerraMultisigWalletData.is(serializedData)) {
    const proxyAddress = serializedData.proxyAddress;
    const currentAdmin = serializedData.currentAdmin;
    if (!proxyAddress || !currentAdmin) return null;

    const multisigKey = new MultisigKey({ chain: serializedData.chain });
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
      chain: serializedData.chain,
      owner: multisigKey.serialize(),
      proxyAddress,
    };
  }

  return null;
}
