import { AbstractBankSdk } from "./bank";
import { AbstractContractsSdk } from "./contracts";
import { AbstractGatekeeperSdk } from "./gatekeeper";
import { AbstractStakingSdk } from "./staking";
import { AbstractTransactionsSdk } from "./transactions";
import { Chain } from "../../chains";
import { MultisigKey } from "../../data-structures";
import { QueryClientNamespace } from "../../query-client";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractUserInteractionResponse } from "../../user-interactions/abstract";
import { BroadcastTransactionResult, Coin, FormattedCoin } from "../common";

export * from "./bank";
export * from "./contracts";
export * from "./gatekeeper";
export * from "./messages";
export * from "./multisig-wallet";
export * from "./staking";
export * from "./transactions";

export abstract class AbstractSdk {
  protected queryNamespace: QueryClientNamespace<"sdk", { chainId: Chain }>;

  public abstract bank: AbstractBankSdk;
  public abstract contracts: AbstractContractsSdk;
  public abstract gatekeeper: AbstractGatekeeperSdk;
  public abstract staking: AbstractStakingSdk;
  public abstract transactions: AbstractTransactionsSdk;

  protected constructor(protected chainId: Chain) {
    this.queryNamespace = new QueryClientNamespace("sdk", { chainId });
  }

  // TODO: move into TransactionsSdk
  public abstract createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction>;

  // TODO: maybe internal MultisigWallet SDK, see usages
  public abstract canExecute({
    address,
    proxyAddress,
    messages,
  }: {
    address: string;
    proxyAddress: string;
    messages: Message[];
  }): Promise<boolean>;

  // TODO: move into TransactionsSdk
  public abstract broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }): Promise<BroadcastTransactionResult>;

  // TODO: internal Wallets SDK
  public abstract createWallet({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<
    AbstractUserInteractionResponse<
      { proxyAddress: string },
      {
        description: string;
        originalPayload: BroadcastTransactionResult;
      }
    >
  >;

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
