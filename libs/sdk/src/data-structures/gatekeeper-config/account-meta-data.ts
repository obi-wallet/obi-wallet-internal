import { z } from "zod";

import { migratable } from "../migratable";

export const AccountMetaData = migratable(
  z.object({
    name: z.string(),
    icon: z.string(),
  })
);
