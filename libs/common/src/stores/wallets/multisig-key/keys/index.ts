import * as t from "io-ts";

import { SerializedCloudKeyPayload } from "./cloud";
import { SerializedDeviceKeyPayload } from "./device";
import { SerializedNfcKeyPayload } from "./nfc";
import { SerializedEmailKeyPayload } from "./email";
import { SerializedPhoneKeyPayload } from "./phone";
import { Secp256k1PublicKey } from "./public-key";
import { SerializedSocialKeyPayload } from "./social";

export enum KeyType {
  Device = "device",
  Phone = "phone",
  Social = "social",
  Nfc = "nfc",
  Cloud = "cloud",
  Email = "email",
}

export const SerializedDeviceKey = t.type({
  type: t.literal(KeyType.Device),
  payload: SerializedDeviceKeyPayload,
});

export type SerializedDeviceKey = t.TypeOf<typeof SerializedDeviceKey>;

export const SerializedPhoneKey = t.type({
  type: t.literal(KeyType.Phone),
  payload: SerializedPhoneKeyPayload,
});

export type SerializedPhoneKey = t.TypeOf<typeof SerializedPhoneKey>;

export const SerializedSocialKey = t.type({
  type: t.literal(KeyType.Social),
  payload: SerializedSocialKeyPayload,
});

export type SerializedSocialKey = t.TypeOf<typeof SerializedSocialKey>;

export const SerializedNfcKey = t.type({
  type: t.literal(KeyType.Nfc),
  payload: SerializedNfcKeyPayload,
});

export type SerializedNfcKey = t.TypeOf<typeof SerializedNfcKey>;

export const SerializedCloudKey = t.type({
  type: t.literal(KeyType.Cloud),
  payload: SerializedCloudKeyPayload,
});

export type SerializedCloudKey = t.TypeOf<typeof SerializedCloudKey>;

export const SerializedPendingRecoveryKey = t.type({
  payload: t.type({
    type: t.string,
    publicKey: Secp256k1PublicKey,
  }),
});

export const SerializedEmailKey = t.type({
  type: t.literal(KeyType.Email),
  payload: SerializedEmailKeyPayload,
});

export type SerializedEmailKey = t.TypeOf<typeof SerializedEmailKey>;

export type SerializedPendingRecoveryKey = t.TypeOf<
  typeof SerializedPendingRecoveryKey
>;

export const SerializedKey = t.union([
  SerializedDeviceKey,
  SerializedPhoneKey,
  SerializedSocialKey,
  SerializedNfcKey,
  SerializedCloudKey,
  SerializedEmailKey,
]);

export type SerializedKey = t.TypeOf<typeof SerializedKey>;

export function isUsableKey(
  key: SerializedKey | SerializedPendingRecoveryKey
): key is SerializedKey {
  return SerializedKey.is(key);
}

export const SerializedMultisigKey = t.type({
  keys: t.readonly(
    t.array(t.union([SerializedKey, SerializedPendingRecoveryKey]))
  ),
  threshold: t.number,
});

export type SerializedMultisigKey = t.TypeOf<typeof SerializedMultisigKey>;
