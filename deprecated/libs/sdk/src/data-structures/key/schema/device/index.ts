import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";

export const DeviceKey = z.object({
  type: z.literal(KeyType.Device),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    privateKey: z.string().optional(),
  }),
});
