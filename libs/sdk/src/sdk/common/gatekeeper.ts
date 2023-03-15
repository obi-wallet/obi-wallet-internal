import { z } from "zod";

export const PermissionedAddress = z.object({
  address: z.string(),
  params: z.object({
    address: z.string(),
    period_type: z.union([z.literal("days"), z.literal("months")]),
    period_multiple: z.number(),
    spend_limits: z.array(
      z.object({
        denom: z.string(),
        amount: z.string(),
        current_balance: z.string(),
        limit_remaining: z.string(),
      })
    ),
  }),
});

export type PermissionedAddress = z.infer<typeof PermissionedAddress>;

export interface GatekeeperContractAddresses {
  spendLimitGatekeeper: string | null;
  sessionKeyGatekeeper: string | null;
  debtGatekeeper: string | null;
}
