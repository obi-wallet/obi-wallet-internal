import { AbstractSdk } from "./abstract";
import { SecretJsChainId } from "../../chains";
import { SecretJsClient } from "../../clients";
import { SecretJsBankSdk } from "../bank";
import { AbstractContractsSdk, SecretJsContractsSdk } from "../contracts";
import {
  AbstractGatekeeperSdk,
  NotImplementedGatekeeperSdk,
} from "../gatekeeper";
import { AbstractStakingSdk, NotImplementedStakingSdk } from "../staking";
import { AbstractTransactionsSdk } from "../transactions";

export class SecretJsSdk extends AbstractSdk {
  public bank: SecretJsBankSdk;
  public contracts: AbstractContractsSdk;
  public gatekeeper: AbstractGatekeeperSdk;
  public staking: AbstractStakingSdk;
  public transactions: AbstractTransactionsSdk;

  protected constructor(protected override chainId: SecretJsChainId) {
    super(chainId);
    const client = new SecretJsClient(chainId);
    this.bank = new SecretJsBankSdk({ chainId });
    this.contracts = new SecretJsContractsSdk({ chainId, client });
    this.gatekeeper = new NotImplementedGatekeeperSdk(chainId);
    this.staking = new NotImplementedStakingSdk(chainId);
    // TODO:
    this.transactions = null!;
  }

  public static chainId(chainId: SecretJsChainId) {
    return new SecretJsSdk(chainId);
  }
}
