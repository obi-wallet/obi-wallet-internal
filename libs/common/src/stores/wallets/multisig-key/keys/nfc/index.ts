import { z } from "zod";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedNfcKeyPayload = z.object({
  publicKey: Secp256k1PublicKey,
  localEntropy: z.string(),
});

export type SerializedNfcKeyPayload = z.infer<typeof SerializedNfcKeyPayload>;
