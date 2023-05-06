import { CosmosChainId } from "../../chains";
import { CosmJsClient } from "../../clients";
import { AbstractSdk } from "../abstract";

export class CosmosSdk extends AbstractSdk {
  // public bank: LegacyCosmosBankSdk;
  // public contracts: LegacyCosmosContractsSdk;
  // public gatekeeper: LegacyCosmosGatekeeperSdk;
  // public staking: LegacyCosmosStakingSdk;
  // public transactions: LegacyCosmosTransactionsSdk;

  protected client: CosmJsClient;

  protected constructor(protected chainId: CosmosChainId) {
    super(chainId);
    this.client = new CosmJsClient(chainId);
  }

  public static chainId(chainId: CosmosChainId) {
    return new CosmosSdk(chainId);
  }
}
