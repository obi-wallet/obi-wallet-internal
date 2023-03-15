import { z } from "zod";

export const BeneficiaryPermissionedAddress = z.object({
  address: z.string(),
  beneficiary_params: z.object({
    address: z.string(),
    cooldown: z.number(),
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
  params: z.null(),
});

export type BeneficiaryPermissionedAddress = z.infer<
  typeof BeneficiaryPermissionedAddress
>;

export const FlexAccountPermissionedAddress = z.object({
  address: z.string(),
  beneficiary_params: z.null(),
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

export type FlexAccountPermissionedAddress = z.infer<
  typeof FlexAccountPermissionedAddress
>;

export const PermissionedAddress = z.union([
  BeneficiaryPermissionedAddress,
  FlexAccountPermissionedAddress,
]);

export type PermissionedAddress = z.infer<typeof PermissionedAddress>;

export interface GatekeeperContractAddresses {
  spendLimitGatekeeper: string | null;
  sessionKeyGatekeeper: string | null;
  debtGatekeeper: string | null;
}
