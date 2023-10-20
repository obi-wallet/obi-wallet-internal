import { z } from "zod";

import { Key } from "../key";
import { migratable } from "../migratable";

export const MultisigKeySchema = migratable(
  z.object({
    keys: z.array(Key.schema.migratableSchema),
    threshold: z.number().int().positive(),
    signingPublicKey: z.string(),
    evmSigningAddress: z.string(),
    evmUserContractAddress: z.string(),
  }),
);
