export interface Token {
  id: string;
  amount: string;
}

export interface EnrichedToken {
  id: string;
  contract: string | null;
  icon: string | null;
  denom: string;
  digits: number;
  label: string;
  amount: number;
  usdValue: number | null;
}
