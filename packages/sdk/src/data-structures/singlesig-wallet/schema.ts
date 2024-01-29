import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { migratable } from "../migratable";

export const SinglesigWalletSchema = migratable(
  z.object({
    type: z.literal("singlesig-wallet"),
    publicKey: Secp256k1PublicKey,
    privateKey: z.string(),
  }),
);
