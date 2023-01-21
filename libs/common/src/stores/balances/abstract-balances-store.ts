export interface Coin {
  contract?: string;
  denom: string;
  amount: string;
}

export interface ExtendedCoin extends Coin {
  usdPrice: number;
}

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

export abstract class AbstractBalancesStore {
  public abstract getBalances(): ExtendedCoin[];
  public abstract fetchBalances(): Promise<void>;
  public abstract getDelegations(): Delegation[];
  public abstract fetchDelegations(): Promise<void>;
  public abstract getUnbondingDelegations(): UnbondingDelegation[];
  public abstract fetchUnbondingDelegations(): Promise<void>;
  public abstract getValidators(): ExtendedValidator[];
  public abstract fetchValidators(): Promise<void>;
  public abstract getRewards(): Rewards;
  public abstract fetchRewards(): Promise<void>;
}
