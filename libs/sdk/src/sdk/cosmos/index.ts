import { CosmosChainId } from "../../chains";
import { CosmJsClient } from "../../clients";
import { AbstractSdk } from "../abstract";
import { CosmosBankSdk } from "../bank/cosmos";
import { CosmJsContractsSdk } from "../contracts";

export class CosmosSdk extends AbstractSdk {
  public bank: CosmosBankSdk;
  public contracts: CosmJsContractsSdk;
  // public gatekeeper: LegacyCosmosGatekeeperSdk;
  // public staking: LegacyCosmosStakingSdk;
  // public transactions: LegacyCosmosTransactionsSdk;

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
  }

  public static chainId(chainId: CosmosChainId) {
    return new CosmosSdk(chainId);
  }
}
