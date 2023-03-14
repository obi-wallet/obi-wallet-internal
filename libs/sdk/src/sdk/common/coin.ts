export interface Coin {
  contract?: string;
  denom: string;
  amount: string;
}

export interface Validator {
  icon: string | null;
  label: string;
  address: string;
}

export interface Delegation {
  balance: { denom: string; amount: string };
  validator: Validator;
}
