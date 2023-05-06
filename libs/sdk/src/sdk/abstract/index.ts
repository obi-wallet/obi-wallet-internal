import { AbstractContractsSdk } from "./contracts";
import { AbstractGatekeeperSdk } from "./gatekeeper";
import { AbstractStakingSdk } from "./staking";
import { AbstractTransactionsSdk } from "./transactions";
import { ChainId } from "../../chains";
import { AbstractBankSdk } from "../bank";

export * from "./contracts";
export * from "./gatekeeper";
export * from "./messages";
export * from "./multisig-wallet";
export * from "./staking";
export * from "./transactions";

export abstract class AbstractSdk {
  public abstract bank: AbstractBankSdk;
  public abstract contracts: AbstractContractsSdk;
  public abstract gatekeeper: AbstractGatekeeperSdk;
  public abstract staking: AbstractStakingSdk;
  public abstract transactions: AbstractTransactionsSdk;

  protected constructor(protected chainId: ChainId) {}
}
