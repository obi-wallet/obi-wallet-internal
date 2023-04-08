import { AbstractBankSdk } from "./bank";
import { AbstractContractsSdk } from "./contracts";
import { AbstractGatekeeperSdk } from "./gatekeeper";
import { AbstractStakingSdk } from "./staking";
import { AbstractTransactionsSdk } from "./transactions";
import { Chain } from "../../chains";
import { Coin, FormattedCoin } from "../common";

export * from "./bank";
export * from "./contracts";
export * from "./gatekeeper";
export * from "./messages";
export * from "./multisig-wallet";
export * from "./staking";
export * from "./transactions";

export abstract class AbstractSdk {
  public abstract bank: AbstractBankSdk;
  public abstract contracts: AbstractContractsSdk;
  public abstract gatekeeper: AbstractGatekeeperSdk;
  public abstract staking: AbstractStakingSdk;
  public abstract transactions: AbstractTransactionsSdk;

  protected constructor(protected chainId: Chain) {}

  // TODO: coin-specific class
  public formatCoin(coin: Coin): FormattedCoin {
    const digits = 6;
    const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
    return {
      icon: null,
      denom: coin.denom,
      digits: 6,
      label: "Unknown Token",
      amount: amount,
    };
  }
}
