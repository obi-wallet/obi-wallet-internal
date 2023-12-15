import { z } from "zod";

import { Secp256k1PublicKey } from "../../keys";
import { migratable } from "../migratable";

export const SinglesigWalletSchema = migratable(
  z.object({
    type: z.literal("singlesig-wallet"),
    publicKey: Secp256k1PublicKey,
    privateKey: z.string(),
  }),
);
