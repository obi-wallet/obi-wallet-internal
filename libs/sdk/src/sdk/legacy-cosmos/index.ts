import { LegacyCosmosContractsSdk } from "./contracts";
import { LegacyCosmosGatekeeperSdk } from "./gatekeeper";
import { LegacyCosmosStakingSdk } from "./staking";
import { LegacyCosmosTransactionsSdk } from "./transactions";
import { LegacyCosmosChainId } from "../../chains";
import { CosmJsClient } from "../../clients";
import { AbstractSdk } from "../abstract";
import { LegacyCosmosBankSdk } from "../bank";

export class LegacyCosmosSdk extends AbstractSdk {
  public bank: LegacyCosmosBankSdk;
  public contracts: LegacyCosmosContractsSdk;
  public gatekeeper: LegacyCosmosGatekeeperSdk;
  public staking: LegacyCosmosStakingSdk;
  public transactions: LegacyCosmosTransactionsSdk;

  protected client: CosmJsClient;

  protected constructor(protected chainId: LegacyCosmosChainId) {
    super(chainId);
    this.client = new CosmJsClient(chainId);
    this.bank = new LegacyCosmosBankSdk({
      chainId,
      client: this.client,
    });
    this.contracts = new LegacyCosmosContractsSdk({
      chainId,
      client: this.client,
    });
    this.gatekeeper = new LegacyCosmosGatekeeperSdk({
      chainId,
      client: this.client,
    });
    this.staking = new LegacyCosmosStakingSdk({
      chainId,
      client: this.client,
    });
    this.transactions = new LegacyCosmosTransactionsSdk({
      chainId,
      client: this.client,
    });
  }

  public static chainId(chainId: LegacyCosmosChainId) {
    return new LegacyCosmosSdk(chainId);
  }
}
