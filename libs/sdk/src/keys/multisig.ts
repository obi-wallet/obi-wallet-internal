import { z } from "zod";

import { Secp256k1PublicKey } from "./sec256k1";

export const MultisigPublicKey = z.object({
  type: z.literal("tendermint/PubKeyMultisigThreshold"),
  value: z.object({
    threshold: z.string(),
    pubkeys: z.array(Secp256k1PublicKey),
  }),
});

export type MultisigPublicKey = z.infer<typeof MultisigPublicKey>;
