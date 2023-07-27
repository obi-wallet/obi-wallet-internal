import { AbstractSdk } from "./abstract";
import { TerraChainId } from "../../chains";
import { FeatherJsClient } from "../../clients";
import { TerraBankSdk } from "../bank";
import { FeatherJsContractsSdk } from "../contracts";
import { CosmosSdkGatekeeperSdk } from "../gatekeeper";
import { FeatherJsStakingSdk } from "../staking";
import { FeatherJsTransactionsSdk } from "../transactions";

export class TerraSdk extends AbstractSdk {
  public bank: TerraBankSdk;
  public contracts: FeatherJsContractsSdk;
  public gatekeeper: CosmosSdkGatekeeperSdk;
  public staking: FeatherJsStakingSdk;
  public transactions: FeatherJsTransactionsSdk;

  protected constructor(protected override chainId: TerraChainId) {
    super(chainId);
    const client = new FeatherJsClient(chainId);
    this.bank = new TerraBankSdk({
      chainId,
      client,
    });
    this.contracts = new FeatherJsContractsSdk({
      chainId,
      client,
    });
    this.gatekeeper = new CosmosSdkGatekeeperSdk({
      chainId,
      client,
    });
    this.staking = new FeatherJsStakingSdk({
      chainId,
      client,
    });
    this.transactions = new FeatherJsTransactionsSdk({
      chainId,
      client,
    });
  }

  public static chainId(chainId: TerraChainId) {
    return new TerraSdk(chainId);
  }
}
