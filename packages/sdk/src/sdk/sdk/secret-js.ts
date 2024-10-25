import { AbstractSdk } from "./abstract";
import { SecretJsClient } from "../../clients";
import { SecretJsHomeChainId } from "../../home-chains";
import { SecretJsBankSdk } from "../bank";
import { SecretJsContractsSdk } from "../contracts";
import { NotImplementedGatekeeperSdk } from "../gatekeeper";
import { NotImplementedStakingSdk } from "../staking";
import { SecretJsTransactionsSdk } from "../transactions";

export class SecretJsSdk extends AbstractSdk {
  public bank: SecretJsBankSdk;
  public contracts: SecretJsContractsSdk;
  public gatekeeper: NotImplementedGatekeeperSdk;
  public staking: NotImplementedStakingSdk;
  public transactions: SecretJsTransactionsSdk;

  protected constructor(protected override chainId: SecretJsHomeChainId) {
    super(chainId);
    const client = new SecretJsClient(chainId);
    this.bank = new SecretJsBankSdk({ chainId });
    this.contracts = new SecretJsContractsSdk({ chainId, client });
    this.gatekeeper = new NotImplementedGatekeeperSdk(chainId);
    this.staking = new NotImplementedStakingSdk(chainId);
    this.transactions = new SecretJsTransactionsSdk({ chainId, client });
  }

  public static chainId(chainId: SecretJsHomeChainId) {
    return new SecretJsSdk(chainId);
  }
}
