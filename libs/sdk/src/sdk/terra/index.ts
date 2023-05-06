import { TerraGatekeeperSdk } from "./gatekeeper";
import { TerraStakingSdk } from "./staking";
import { TerraTransactionsSdk } from "./transactions";
import { TerraChainId } from "../../chains";
import { FeatherJsClient } from "../../clients";
import { AbstractSdk } from "../abstract";
import { TerraBankSdk } from "../bank";
import { FeatherJsContractsSdk } from "../contracts";

export class TerraSdk extends AbstractSdk {
  public bank: TerraBankSdk;
  public contracts: FeatherJsContractsSdk;
  public gatekeeper: TerraGatekeeperSdk;
  public staking: TerraStakingSdk;
  public transactions: TerraTransactionsSdk;

  protected client: FeatherJsClient;

  protected constructor(protected chainId: TerraChainId) {
    super(chainId);
    this.client = new FeatherJsClient(chainId);
    this.bank = new TerraBankSdk({
      chainId,
      client: this.client,
    });
    this.contracts = new FeatherJsContractsSdk({
      chainId,
      client: this.client,
    });
    this.gatekeeper = new TerraGatekeeperSdk({
      chainId,
      client: this.client,
    });
    this.staking = new TerraStakingSdk({
      chainId,
      client: this.client,
    });
    this.transactions = new TerraTransactionsSdk({
      chainId,
      client: this.client,
    });
  }

  public static chainId(chainId: TerraChainId) {
    return new TerraSdk(chainId);
  }
}
