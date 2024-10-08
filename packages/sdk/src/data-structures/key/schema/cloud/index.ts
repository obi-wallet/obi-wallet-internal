import {
  Secp256k1PublicKey,
  Sec256k1PrivateKey,
} from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { KeyType } from "../../types";

export const CloudKey = z.object({
  type: z.literal(KeyType.Cloud),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    privateKey: Sec256k1PrivateKey,
  }),
});
