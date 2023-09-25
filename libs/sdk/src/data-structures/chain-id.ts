import { z } from "zod";

import { ChainId } from "../chains";

export const ChainIdSchema: z.ZodType<ChainId> = z.union([
  z.literal("pulsar-3"),
  z.literal("secret-4"),
]);
