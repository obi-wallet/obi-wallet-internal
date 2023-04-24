import { Token } from "./token";

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
  balance: Token;
  validator: Validator;
}

export interface UnbondingDelegation {
  balance: Token;
  validator: Validator;
  completionTime: Date;
}

export interface Rewards {
  perDelegator: { address: string; rewards: Token }[];
  total: Token;
}
