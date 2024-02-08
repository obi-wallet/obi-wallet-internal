import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { KeyType } from "../../types";

export const NfcKey = z.object({
  type: z.literal(KeyType.Nfc),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    localEntropy: z.string(),
  }),
});
