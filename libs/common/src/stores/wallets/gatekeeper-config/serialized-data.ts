import { z } from "zod";

import { Duration, Percentage } from "../../helpers";
import { Secp256k1PublicKey } from "../multisig-key/keys/public-key";

export const AccountMetaData = z.object({
  name: z.string(),
  icon: z.string(),
});

export const Beneficiary = z.object({
  type: z.literal("beneficiary"),
  meta: AccountMetaData,
  address: z.string(),
  dormancyThreshold: Duration,
  dripSchedule: z.object({
    rate: Percentage,
    period: Duration,
  }),
});

export type Beneficiary = z.infer<typeof Beneficiary>;

export const SpendLimit = z.object({
  amount: z.number(),
  period: Duration,
});

export const AutoSign = z.object({
  endTime: z.string().datetime({ offset: true }),
  // TODO: serialized revoke tx ready to broadcast. Although that might not need to be persisted actually.
});

export const FlexAccount = z.object({
  type: z.literal("flex-account"),
  meta: AccountMetaData,
  address: z.string(),
  publicKey: Secp256k1PublicKey,
  privateKey: z.string(),
  spendLimit: SpendLimit.nullable(),
  autoSign: AutoSign.nullable(),
});

export type FlexAccount = z.infer<typeof FlexAccount>;

export const SerializedGatekeeperConfig = z.object({
  beneficiaries: z.array(Beneficiary),
  flexAccounts: z.array(FlexAccount),
});

export type SerializedGatekeeperConfig = z.infer<
  typeof SerializedGatekeeperConfig
>;
