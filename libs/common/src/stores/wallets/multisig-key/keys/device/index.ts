import { z } from "zod";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedDeviceKeyPayload = z.object({
  publicKey: Secp256k1PublicKey,
});

export type SerializedDeviceKeyPayload = z.infer<
  typeof SerializedDeviceKeyPayload
>;
