import { Coin } from "@obi-wallet/sdk";

export interface Validator {
  icon: string | null;
  label: string;
  address: string;
}

export interface ExtendedValidator extends Validator {
  votingPower: string;
  commission: string;
  rank: number;
  promoted: boolean;
  active: boolean;
  jailed: boolean;
}

export interface Delegation {
  balance: { denom: string; amount: string };
  validator: Validator;
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
