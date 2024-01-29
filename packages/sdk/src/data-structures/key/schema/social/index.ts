import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { KeyType } from "../../types";

export const SocialKey = z.object({
  type: z.literal(KeyType.Social),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
  }),
});
