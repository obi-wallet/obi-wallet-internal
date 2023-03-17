import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../../keys";
import { KeyType } from "../key-type";

export const NfcKey = z.object({
  type: z.literal(KeyType.Nfc),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    localEntropy: z.string(),
  }),
});
