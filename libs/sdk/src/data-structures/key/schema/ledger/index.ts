import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";
export const LedgerKey = z.object({
  type: z.literal(KeyType.Ledger),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
  }),
});
