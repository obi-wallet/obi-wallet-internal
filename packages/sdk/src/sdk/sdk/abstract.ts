import { HomeChainId } from "../../home-chains";
import { AbstractBankSdk } from "../bank";
import { AbstractContractsSdk } from "../contracts";
import { AbstractGatekeeperSdk } from "../gatekeeper";
import { AbstractStakingSdk } from "../staking";
import { AbstractTransactionsSdk } from "../transactions";

export abstract class AbstractSdk {
  public abstract bank: AbstractBankSdk;
  public abstract contracts: AbstractContractsSdk;
  public abstract gatekeeper: AbstractGatekeeperSdk;
  public abstract staking: AbstractStakingSdk;
  public abstract transactions: AbstractTransactionsSdk;

  protected constructor(protected chainId: HomeChainId) {}
}
