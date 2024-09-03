import {
  Sec256k1PrivateKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { KeyType } from "../../types";

export const CloudKey = z.object({
  type: z.literal(KeyType.Passkey),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    privateKey: Sec256k1PrivateKey,
  }),
});
