import { z } from "zod";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedCloudKeyProvider = z.literal("google-drive");

export const SerializedCloudKeyPayload = z.object({
  provider: SerializedCloudKeyProvider,
  publicKey: Secp256k1PublicKey,
  privateKey: z.string(),
});

export type SerializedCloudKeyPayload = z.infer<
  typeof SerializedCloudKeyPayload
>;
