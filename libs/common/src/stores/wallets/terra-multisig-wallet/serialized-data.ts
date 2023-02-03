import * as t from "io-ts";

import { nullable } from "../../helpers";
import { MultisigKey } from "../multisig-key";
import * as Multisig from "../multisig-wallet/serialized-data";

export const Secp256k1PublicKey = t.type({
  type: t.literal("tendermint/PubKeySecp256k1"),
  value: t.string,
});
export type Secp256k1PublicKey = t.TypeOf<typeof Secp256k1PublicKey>;

export const SerializedBiometricsPayload = t.type({
  publicKey: Secp256k1PublicKey,
});
export type SerializedBiometricsPayload = t.TypeOf<
  typeof SerializedBiometricsPayload
>;

export const SerializedBiometricsPayloadAnyVersion = t.union([
  SerializedBiometricsPayload,
  SerializedBiometricsPayload,
]);
export type SerializedBiometricsPayloadAnyVersion = t.TypeOf<
  typeof SerializedBiometricsPayloadAnyVersion
>;

export function migrateSerializedBiometricsPayload(
  serializedBiometricsPayload: SerializedBiometricsPayloadAnyVersion | null
): SerializedBiometricsPayload | null {
  return serializedBiometricsPayload;
}

export const SerializedPhoneNumberPayload = t.type({
  publicKey: Secp256k1PublicKey,
  phoneNumber: t.string,
  securityQuestion: t.string,
});
export type SerializedPhoneNumberPayload = t.TypeOf<
  typeof SerializedPhoneNumberPayload
>;

export const SerializedPhoneNumberPayloadAnyVersion = t.union([
  SerializedPhoneNumberPayload,
  SerializedPhoneNumberPayload,
]);

export type SerializedPhoneNumberPayloadAnyVersion = t.TypeOf<
  typeof SerializedPhoneNumberPayloadAnyVersion
>;

export function migrateSerializedPhoneNumberPayload(
  serializedPhoneNumberPayload: SerializedPhoneNumberPayloadAnyVersion | null
): SerializedPhoneNumberPayload | null {
  return serializedPhoneNumberPayload;
}

export const SerializedSocialPayload = t.type({
  publicKey: Secp256k1PublicKey,
});
export type SerializedSocialPayload = t.TypeOf<typeof SerializedSocialPayload>;

export const SerializedCloudPayload = t.type({
  publicKey: Secp256k1PublicKey,
});
export type SerializedCloudPayload = t.TypeOf<typeof SerializedCloudPayload>;

export const SerializedMultisigPayload = t.type({
  biometrics: nullable(SerializedBiometricsPayload),
  phoneNumber: nullable(SerializedPhoneNumberPayload),
  social: nullable(SerializedSocialPayload),
});
export type SerializedMultisigPayload = t.TypeOf<
  typeof SerializedMultisigPayload
>;

export const SerializedMultisigPayloadAnyVersion = t.union([
  SerializedMultisigPayload,
  SerializedMultisigPayload,
]);

export type SerializedMultisigPayloadAnyVersion = t.TypeOf<
  typeof SerializedMultisigPayloadAnyVersion
>;

export const migrateSerializedMultisigPayload = (
  serializedMultisigPayload: SerializedMultisigPayloadAnyVersion
): SerializedMultisigPayload => {
  return serializedMultisigPayload;
};

export const SerializedProxyAddress = t.type({
  address: t.string,
  codeId: t.number,
});
export type SerializedProxyAddress = t.TypeOf<typeof SerializedProxyAddress>;

export const SerializedProxyAddressAnyVersion = t.union([
  SerializedProxyAddress,
  SerializedProxyAddress,
]);

export type SerializedProxyAddressAnyVersion = t.TypeOf<
  typeof SerializedProxyAddressAnyVersion
>;

export function migrateSerializedProxyAddress(
  serializedProxyAddress: SerializedProxyAddressAnyVersion | null
): SerializedProxyAddress | null {
  return serializedProxyAddress;
}

export const TerraChain = t.union([
  t.literal("pisco-1"),
  t.literal("phoenix-1"),
]);

export const SerializedData = t.type({
  chain: TerraChain,
  nextAdmin: SerializedMultisigPayload,
  currentAdmin: nullable(SerializedMultisigPayload),
  proxyAddress: nullable(SerializedProxyAddress),
});
export const SerializedDataAnyVersion = t.union([
  SerializedData,
  SerializedData,
]);
export type SerializedDataAnyVersion = t.TypeOf<
  typeof SerializedDataAnyVersion
>;

export function migrateSerializedData(
  serializedData: SerializedDataAnyVersion
): Multisig.SerializedData | null {
  if (SerializedData.is(serializedData)) {
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
