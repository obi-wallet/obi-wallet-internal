import { Coin } from "./common";
import { Chain } from "../chains";

export abstract class AbstractSdk {
  protected constructor(protected chainId: Chain) {}

  public abstract fetchPrices(): Promise<Record<string, number>>;
  public abstract fetchBalances({
    address,
  }: {
    address: string;
  }): Promise<Coin[]>;
}
