import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";

export const SocialKey = z.object({
  type: z.literal(KeyType.Social),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
  }),
});
