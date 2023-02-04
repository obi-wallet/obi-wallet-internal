import * as t from "io-ts";

import { SerializedDeviceKeyPayload } from "./device";
import { SerializedEmailKeyPayload } from "./email";
import { SerializedPhoneKeyPayload } from "./phone";
import { SerializedSocialKeyPayload } from "./social";

export enum KeyType {
  Device = "device",
  Phone = "phone",
  Social = "social",
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

export const SerializedEmailKey = t.type({
  type: t.literal(KeyType.Email),
  payload: SerializedEmailKeyPayload,
});

export type SerializedEmailKey = t.TypeOf<typeof SerializedEmailKey>;

export const SerializedKey = t.union([
  SerializedDeviceKey,
  SerializedPhoneKey,
  SerializedSocialKey,
  SerializedEmailKey,
]);

export type SerializedKey = t.TypeOf<typeof SerializedKey>;

export const SerializedMultisigKey = t.type({
  keys: t.readonly(t.array(SerializedKey)),
  threshold: t.number,
});

export type SerializedMultisigKey = t.TypeOf<typeof SerializedMultisigKey>;
