import { z } from "zod";

import { Key } from "./keys";
import { migratable } from "../migratable";

export const MultisigKeySchema = migratable(
  z.object({
    keys: z.array(Key.schema.migratableSchema),
    threshold: z.number().int().positive(),
  })
);
