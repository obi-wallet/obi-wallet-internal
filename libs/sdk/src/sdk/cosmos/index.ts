import { CosmosBankSdk } from "./bank";
import { CosmosClient } from "./client";
import { CosmosContractsSdk } from "./contracts";
import { CosmosGatekeeperSdk } from "./gatekeeper";
import { CosmosStakingSdk } from "./staking";
import { CosmosTransactionsSdk } from "./transactions";
import { CosmosChain, cosmosChains } from "../../chains";
import { AbstractSdk } from "../abstract";
import { Coin, FormattedCoin } from "../common";

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

  public get chain() {
    return cosmosChains[this.chainId];
  }

  public formatCoin(coin: Coin): FormattedCoin {
    switch (coin.denom) {
      case this.chain.denom: {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: null,
          denom: this.chain.denom.slice(1).toUpperCase(),
          digits,
          label: this.chain.denom[1].toUpperCase() + this.chain.denom.slice(2),
          amount,
        };
      }
      case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034": {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: null,
          denom: "axlUSDC",
          digits,
          label: "USDC (Axelar)",
          amount,
        };
      }
      case "uloop": {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: null,
          denom: "LOOP",
          digits,
          label: "Loop",
          amount,
        };
      }
      default:
        return super.formatCoin(coin);
    }
  }

  public static chainId(chainId: CosmosChain) {
    return new CosmosSdk(chainId);
  }
}
