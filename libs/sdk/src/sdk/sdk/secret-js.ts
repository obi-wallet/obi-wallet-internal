import { AbstractSdk } from "./abstract";
import { SecretJsChainId } from "../../chains";
import { SecretJsBankSdk } from "../bank";
import { AbstractContractsSdk } from "../contracts";
import { AbstractGatekeeperSdk } from "../gatekeeper";
import { AbstractStakingSdk } from "../staking";
import { AbstractTransactionsSdk } from "../transactions";

export class SecretJsSdk extends AbstractSdk {
  public bank: SecretJsBankSdk;
  public contracts: AbstractContractsSdk;
  public gatekeeper: AbstractGatekeeperSdk;
  public staking: AbstractStakingSdk;
  public transactions: AbstractTransactionsSdk;

  protected constructor(protected override chainId: SecretJsChainId) {
    super(chainId);
    this.bank = new SecretJsBankSdk({ chainId });
    // TODO:
    this.contracts = null!;
    this.gatekeeper = null!;
    this.staking = null!;
    this.transactions = null!;
  }

  public static chainId(chainId: SecretJsChainId) {
    return new SecretJsSdk(chainId);
  }
}
