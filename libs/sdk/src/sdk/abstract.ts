import {
  Coin,
  Delegation,
  EnrichedValidator,
  UnbondingDelegation,
} from "./common";
import { Chain } from "../chains";

export abstract class AbstractSdk {
  protected constructor(protected chainId: Chain) {}

  public abstract fetchPrices(): Promise<Record<string, number>>;
  public abstract fetchBalances({
    address,
  }: {
    address: string;
  }): Promise<Coin[]>;

  public abstract fetchDelegations({
    address,
  }: {
    address: string;
  }): Promise<Delegation[]>;
  public abstract fetchUnbondingDelegations({
    address,
  }: {
    address: string;
  }): Promise<UnbondingDelegation[]>;
  public abstract fetchValidators(): Promise<EnrichedValidator[]>;
}
