import { z } from "zod";

export const Secp256k1PublicKey = z.object({
  type: z.literal("tendermint/PubKeySecp256k1"),
  value: z.string(),
});

export type Secp256k1PublicKey = z.infer<typeof Secp256k1PublicKey>;
