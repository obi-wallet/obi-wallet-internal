import { Coin } from "./coin";

export interface Validator {
  icon: string | null;
  label: string;
  address: string;
}

export interface EnrichedValidator extends Validator {
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
