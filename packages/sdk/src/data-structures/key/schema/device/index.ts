import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { KeyType } from "../../types";

export const DeviceKey = z.object({
  type: z.literal(KeyType.Device),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    privateKey: z.string().optional(),
  }),
});
