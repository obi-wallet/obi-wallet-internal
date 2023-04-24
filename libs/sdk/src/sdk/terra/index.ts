import { TerraBankSdk } from "./bank";
import { TerraClient } from "./client";
import { TerraContractsSdk } from "./contracts";
import { TerraGatekeeperSdk } from "./gatekeeper";
import { TerraStakingSdk } from "./staking";
import { TerraTransactionsSdk } from "./transactions";
import { TerraChain } from "../../chains";
import { AbstractSdk } from "../abstract";

export class TerraSdk extends AbstractSdk {
  public bank: TerraBankSdk;
  public contracts: TerraContractsSdk;
  public gatekeeper: TerraGatekeeperSdk;
  public staking: TerraStakingSdk;
  public transactions: TerraTransactionsSdk;

  protected client: TerraClient;

  protected constructor(protected chainId: TerraChain) {
    super(chainId);
    this.client = new TerraClient(chainId);
    this.bank = new TerraBankSdk({
      chainId,
      client: this.client,
    });
    this.contracts = new TerraContractsSdk({
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

  public static chainId(chainId: TerraChain) {
    return new TerraSdk(chainId);
  }
}
