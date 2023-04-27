export interface Token {
  id: string;
  rawAmount: string;
}

export interface EnrichedToken extends Token {
  amount: number;
  contract: string | null;
  icon: string | null;
  denom: string;
  digits: number;
  label: string;
  usdValue: number | null;
}
