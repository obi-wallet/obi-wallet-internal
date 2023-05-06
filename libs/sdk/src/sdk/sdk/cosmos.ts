import { AbstractSdk } from "./abstract";
import { CosmosChainId } from "../../chains";
import { CosmJsClient } from "../../clients";
import { CosmosBankSdk } from "../bank/cosmos";
import { CosmJsContractsSdk } from "../contracts";
import { CosmosSdkGatekeeperSdk } from "../gatekeeper";
import { CosmJsStakingSdk } from "../staking";
import { CosmJsTransactionsSdk } from "../transactions";

export class CosmosSdk extends AbstractSdk {
  public bank: CosmosBankSdk;
  public contracts: CosmJsContractsSdk;
  public gatekeeper: CosmosSdkGatekeeperSdk;
  public staking: CosmJsStakingSdk;
  public transactions: CosmJsTransactionsSdk;

  protected client: CosmJsClient;

  protected constructor(protected chainId: CosmosChainId) {
    super(chainId);
    this.client = new CosmJsClient(chainId);
    this.bank = new CosmosBankSdk({
      chainId,
      client: this.client,
    });
    this.contracts = new CosmJsContractsSdk({
      chainId,
      client: this.client,
    });
    this.gatekeeper = new CosmosSdkGatekeeperSdk({
      chainId,
      client: this.client,
    });
    this.staking = new CosmJsStakingSdk({
      chainId,
      client: this.client,
    });
    this.transactions = new CosmJsTransactionsSdk({
      chainId,
      client: this.client,
    });
  }

  public static chainId(chainId: CosmosChainId) {
    return new CosmosSdk(chainId);
  }
}
