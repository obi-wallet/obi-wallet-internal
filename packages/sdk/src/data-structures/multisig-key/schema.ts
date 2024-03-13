import { z } from "zod";

import { ArrayIndex } from "../array-index";
import { Key } from "../key";
import { migratable } from "../migratable";

export const MultisigKeySchema = migratable(
  z.object({
    keys: z.array(Key.schema.migratableSchema),
    threshold: z.number().int().positive(),
  }),
).addMigration({
  nextSchema: z.object({
    keys: z.array(Key.schema.migratableSchema),
    primaryKeyIndex: ArrayIndex.nullable(),
    threshold: z.number().int().positive(),
  }),
  migrate: (data) => {
    return {
      keys: data.keys,
      threshold: data.threshold,
      primaryKeyIndex: data.keys.length > 0 ? 0 : null,
    };
  },
});
