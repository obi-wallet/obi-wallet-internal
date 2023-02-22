import { z } from "zod";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedSocialKeyPayload = z.object({
  publicKey: Secp256k1PublicKey,
});

export type SerializedSocialKeyPayload = z.infer<
  typeof SerializedSocialKeyPayload
>;
