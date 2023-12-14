import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";

export const PhoneKey = z.object({
  type: z.literal(KeyType.Phone),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    // TODO: remove
    privateKey: z.string(),
    phoneNumber: z.string(),
    securityQuestion: z.string(),
  }),
});
