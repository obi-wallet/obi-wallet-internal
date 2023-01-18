export interface ExtendedCoin {
  contract?: string;
  denom: string;
  amount: string;
  usdPrice: number;
}

export interface Validator {
  icon: string;
  label: string;
  address: string;
}

export interface Delegation {
  balance: { denom: string; amount: string };
  validator: Validator;
}

export abstract class AbstractBalancesStore {
  public abstract getBalances(): ExtendedCoin[];
  public abstract fetchBalances(): Promise<void>;
  public abstract getDelegations(): Delegation[];
  public abstract fetchDelegations(): Promise<void>;
}
