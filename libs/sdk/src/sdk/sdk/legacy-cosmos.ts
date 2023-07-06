import { AbstractSdk } from "./abstract";
import { LegacyCosmosChainId } from "../../chains";
import { CosmJsClient } from "../../clients";
import { LegacyCosmosBankSdk } from "../bank";
import { CosmJsContractsSdk } from "../contracts";
import { LegacyCosmosGatekeeperSdk } from "../gatekeeper";
import { CosmJsStakingSdk } from "../staking";
import { CosmJsTransactionsSdk } from "../transactions";

export class LegacyCosmosSdk extends AbstractSdk {
  public bank: LegacyCosmosBankSdk;
  public contracts: CosmJsContractsSdk;
  public gatekeeper: LegacyCosmosGatekeeperSdk;
  public staking: CosmJsStakingSdk;
  public transactions: CosmJsTransactionsSdk;

  protected client: CosmJsClient;

  protected constructor(protected override chainId: LegacyCosmosChainId) {
    super(chainId);
    this.client = new CosmJsClient(chainId);
    this.bank = new LegacyCosmosBankSdk({
      chainId,
      client: this.client,
    });
    this.contracts = new CosmJsContractsSdk({
      chainId,
      client: this.client,
    });
    this.gatekeeper = new LegacyCosmosGatekeeperSdk({
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

  public static chainId(chainId: LegacyCosmosChainId) {
    return new LegacyCosmosSdk(chainId);
  }
}
