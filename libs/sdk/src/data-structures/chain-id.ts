import { z } from "zod";

export const ChainIdSchema = z.union([
  z.literal("oasis-3"),
  z.literal("uni-3"),
  z.literal("juno-1"),
  z.literal("pisco-1"),
  z.literal("phoenix-1"),
  z.literal("osmo-test-5"),
]);
