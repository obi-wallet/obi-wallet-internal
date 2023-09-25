import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";

export const UnityKey = z.object({
  type: z.literal(KeyType.Unity),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    privateKey: z.string().optional(),
  }),
});
