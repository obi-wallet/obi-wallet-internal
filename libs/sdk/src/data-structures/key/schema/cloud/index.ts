import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";

export const CloudKeyProvider = z.literal("google-drive");

export const CloudKey = z.object({
  type: z.literal(KeyType.Cloud),
  payload: z.object({
    provider: CloudKeyProvider,
    publicKey: Secp256k1PublicKey,
    privateKey: z.string(),
  }),
});
