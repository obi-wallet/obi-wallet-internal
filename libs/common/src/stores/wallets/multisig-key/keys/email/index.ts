import { z } from "zod";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedEmailKeyPayload = z.object({
  publicKey: Secp256k1PublicKey,
});

export type SerializedEmailKeyPayload = z.infer<
  typeof SerializedEmailKeyPayload
>;
