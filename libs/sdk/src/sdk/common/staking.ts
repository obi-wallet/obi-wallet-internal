export interface Validator {
  icon: string | null;
  label: string;
  address: string;
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
