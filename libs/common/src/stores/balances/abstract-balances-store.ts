export interface ExtendedCoin {
  contract?: string;
  denom: string;
  amount: string;
  usdPrice: number;
}

export abstract class AbstractBalancesStore {
  public abstract getBalances(): ExtendedCoin[];
  public abstract fetchBalances(): Promise<void>;
}
