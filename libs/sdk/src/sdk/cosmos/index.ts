import { CosmosBankSdk } from "./bank";
import { CosmosClient } from "./client";
import { CosmosContractsSdk } from "./contracts";
import { CosmosGatekeeperSdk } from "./gatekeeper";
import { CosmosStakingSdk } from "./staking";
import { CosmosTransactionsSdk } from "./transactions";
import { CosmosChain } from "../../chains";
import { AbstractSdk } from "../abstract";

export class CosmosSdk extends AbstractSdk {
  public bank: CosmosBankSdk;
  public contracts: CosmosContractsSdk;
  public gatekeeper: CosmosGatekeeperSdk;
  public staking: CosmosStakingSdk;
  public transactions: CosmosTransactionsSdk;

  protected client: CosmosClient;

  protected constructor(protected chainId: CosmosChain) {
    super(chainId);
    this.client = new CosmosClient(chainId);
    this.bank = new CosmosBankSdk({
      chainId,
      client: this.client,
    });
    this.contracts = new CosmosContractsSdk({
      chainId,
      client: this.client,
    });
    this.gatekeeper = new CosmosGatekeeperSdk({
      chainId,
      client: this.client,
    });
    this.staking = new CosmosStakingSdk({
      chainId,
      client: this.client,
    });
    this.transactions = new CosmosTransactionsSdk({
      chainId,
      client: this.client,
    });
  }

  public static chainId(chainId: CosmosChain) {
    return new CosmosSdk(chainId);
  }
}
