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

  protected constructor(protected override chainId: CosmosChainId) {
    super(chainId);
    const client = new CosmJsClient(chainId);
    this.bank = new CosmosBankSdk({
      chainId,
      client,
    });
    this.contracts = new CosmJsContractsSdk({
      chainId,
      client,
    });
    this.gatekeeper = new CosmosSdkGatekeeperSdk({
      chainId,
      client,
    });
    this.staking = new CosmJsStakingSdk({
      chainId,
      client,
    });
    this.transactions = new CosmJsTransactionsSdk({
      chainId,
      client,
    });
  }

  public static chainId(chainId: CosmosChainId) {
    return new CosmosSdk(chainId);
  }
}
