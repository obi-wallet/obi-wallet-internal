import { Coin, Validator } from "@obi-wallet/sdk";

export interface ExtendedValidator extends Validator {
  votingPower: string;
  commission: string;
  rank: number;
  promoted: boolean;
  active: boolean;
  jailed: boolean;
}

export interface UnbondingDelegation {
  balance: { denom: string; amount: string };
  validator: Validator;
  completionTime: Date;
}

export interface Rewards {
  perDelegator: { address: string; rewards: Coin }[];
  total: Coin;
}

export interface CodeIds {
  userAccount: number;
  spendLimitGatekeeper: number | null;
  debtGatekeeper: number | null;
}
