import { z } from "zod";

export const RpcError = z.object({
  code: z.number(),
  message: z.string(),
});
