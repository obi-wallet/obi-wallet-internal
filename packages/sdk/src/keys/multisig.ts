import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

export const MultisigPublicKey = z.object({
  type: z.literal("tendermint/PubKeyMultisigThreshold"),
  value: z.object({
    threshold: z.string(),
    pubkeys: z.array(Secp256k1PublicKey),
  }),
});

export type MultisigPublicKey = z.infer<typeof MultisigPublicKey>;

export { Secp256k1PublicKey };
