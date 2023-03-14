import { Chain } from "../chains";

export abstract class AbstractSdk {
  protected constructor(protected chainId: Chain) {}

  public abstract fetchPrices(): Promise<Record<string, number>>;
}
