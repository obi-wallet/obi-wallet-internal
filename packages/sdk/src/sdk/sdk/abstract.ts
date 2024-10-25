import { HomeChainId } from "../../home-chains";
import { AbstractTransactionsSdk } from "../transactions";

export abstract class AbstractSdk {
  public abstract transactions: AbstractTransactionsSdk;

  protected constructor(protected chainId: HomeChainId) {}
}
