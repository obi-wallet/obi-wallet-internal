import { z } from "zod";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedPhoneKeyPayload = z.object({
  publicKey: Secp256k1PublicKey,
  phoneNumber: z.string(),
  securityQuestion: z.string(),
});

export type SerializedPhoneKeyPayload = z.infer<
  typeof SerializedPhoneKeyPayload
>;
