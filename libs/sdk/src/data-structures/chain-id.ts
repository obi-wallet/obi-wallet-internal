import { z } from "zod";

import { ChainId } from "../chains";

export const ChainIdSchema: z.ZodType<ChainId> = z.union([
  z.literal("oasis-3"),
  z.literal("uni-3"),
  z.literal("juno-1"),
  z.literal("pisco-1"),
  z.literal("phoenix-1"),
  z.literal("osmo-test-5"),
  z.literal("pulsar-2"),
  z.literal("pulsar-3"),
]);
