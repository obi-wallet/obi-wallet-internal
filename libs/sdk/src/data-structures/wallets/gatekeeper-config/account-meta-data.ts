import { z } from "zod";

export const AccountMetaData = z.object({
  name: z.string(),
  icon: z.string(),
});
