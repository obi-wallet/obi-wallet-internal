import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../key-type";

export const EmailKey = z.object({
  type: z.literal(KeyType.Email),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
  }),
});
