export interface Coin {
  contract?: string;
  denom: string;
  amount: string;
}

export interface FormattedCoin {
  icon: { uri: string } | null;
  denom: string;
  digits: number;
  label: string;
  amount: number;
}
