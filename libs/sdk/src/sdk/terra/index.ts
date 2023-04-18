import * as R from "ramda";

import { TerraBankSdk } from "./bank";
import { TerraClient } from "./client";
import { TerraContractsSdk } from "./contracts";
import { TerraGatekeeperSdk } from "./gatekeeper";
import { TerraStakingSdk } from "./staking";
import { tokens } from "./tokens";
import { TerraTransactionsSdk } from "./transactions";
import { TerraChain, terraChains } from "../../chains";
import { AbstractSdk } from "../abstract";
import { Coin, FormattedCoin } from "../common";

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

  public get chain() {
    return terraChains[this.chainId];
  }

  public formatCoin(coin: Coin): FormattedCoin {
    const key = R.has("contract", coin) ? coin.contract : coin.denom;

    if (!key || !R.has(key, tokens)) {
      return super.formatCoin(coin);
    }

    const token = tokens[key as keyof typeof tokens];
    const denom =
      R.prop("base_denom", token) ??
      R.prop("denom", token) ??
      R.prop("symbol", token) ??
      coin.denom;

    return {
      icon: token.icon ? { uri: token.icon } : null,
      denom: (() => {
        if (denom.startsWith("u")) {
          return denom.slice(1).toUpperCase();
        }
        return denom;
      })(),
      digits: token.decimals,
      label: R.prop("name", token) ?? R.prop("symbol", token) ?? coin.denom,
      amount: parseInt(coin.amount, 10) / 10 ** token.decimals,
    };
  }

  public static chainId(chainId: TerraChain) {
    return new TerraSdk(chainId);
  }
}
