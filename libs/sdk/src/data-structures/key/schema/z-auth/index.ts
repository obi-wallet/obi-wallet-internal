import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";

export const ZAuthKey = z.object({
  type: z.literal(KeyType.ZAuth),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    privateKey: z.string(),
  }),
});
