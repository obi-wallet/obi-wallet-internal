import { z } from "zod";

import { SerializedCloudKeyPayload } from "./cloud";
import { SerializedDeviceKeyPayload } from "./device";
import { SerializedEmailKeyPayload } from "./email";
import { SerializedNfcKeyPayload } from "./nfc";
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

export const SerializedDeviceKey = z.object({
  type: z.literal(KeyType.Device),
  payload: SerializedDeviceKeyPayload,
});

export type SerializedDeviceKey = z.infer<typeof SerializedDeviceKey>;

export const SerializedPhoneKey = z.object({
  type: z.literal(KeyType.Phone),
  payload: SerializedPhoneKeyPayload,
});

export type SerializedPhoneKey = z.infer<typeof SerializedPhoneKey>;

export const SerializedSocialKey = z.object({
  type: z.literal(KeyType.Social),
  payload: SerializedSocialKeyPayload,
});

export type SerializedSocialKey = z.infer<typeof SerializedSocialKey>;

export const SerializedNfcKey = z.object({
  type: z.literal(KeyType.Nfc),
  payload: SerializedNfcKeyPayload,
});

export type SerializedNfcKey = z.infer<typeof SerializedNfcKey>;

export const SerializedCloudKey = z.object({
  type: z.literal(KeyType.Cloud),
  payload: SerializedCloudKeyPayload,
});

export type SerializedCloudKey = z.infer<typeof SerializedCloudKey>;

export const SerializedPendingRecoveryKey = z.object({
  payload: z.object({
    type: z.string(),
    publicKey: Secp256k1PublicKey,
  }),
});

export const SerializedEmailKey = z.object({
  type: z.literal(KeyType.Email),
  payload: SerializedEmailKeyPayload,
});

export type SerializedEmailKey = z.infer<typeof SerializedEmailKey>;

export type SerializedPendingRecoveryKey = z.infer<
  typeof SerializedPendingRecoveryKey
>;

export const SerializedKey = z.union([
  SerializedDeviceKey,
  SerializedPhoneKey,
  SerializedSocialKey,
  SerializedNfcKey,
  SerializedCloudKey,
  SerializedEmailKey,
]);

export type SerializedKey = z.infer<typeof SerializedKey>;

export function isUsableKey(
  key: SerializedKey | SerializedPendingRecoveryKey
): key is SerializedKey {
  return SerializedKey.safeParse(key).success;
}

export const SerializedMultisigKey = z.object({
  keys: z.array(z.union([SerializedKey, SerializedPendingRecoveryKey])),
  threshold: z.number().int().positive(),
});

export type SerializedMultisigKey = z.infer<typeof SerializedMultisigKey>;
