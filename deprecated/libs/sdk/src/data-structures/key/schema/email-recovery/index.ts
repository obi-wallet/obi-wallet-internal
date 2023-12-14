import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";

export const EmailRecoveryKey = z.object({
  type: z.literal(KeyType.EmailRecovery),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    privateKey: z.string(),
  }),
});
