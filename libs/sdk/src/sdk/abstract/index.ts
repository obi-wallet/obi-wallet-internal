import { AbstractBankSdk } from "./bank";
import { AbstractContractsSdk } from "./contracts";
import { AbstractGatekeeperSdk } from "./gatekeeper";
import { AbstractStakingSdk } from "./staking";
import { AbstractTransactionsSdk } from "./transactions";
import { Chain } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { QueryClientNamespace } from "../../query-client";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractUserInteractionResponse } from "../../user-interactions/abstract";
import {
  BroadcastTransactionResult,
  CodeIds,
  Coin,
  FormattedCoin,
} from "../common";

export * from "./bank";
export * from "./contracts";
export * from "./gatekeeper";
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

  // TODO: internal MultisigWallet SDK
  public abstract fetchCodeIds(wallet: MultisigWallet): Promise<CodeIds>;
  // TODO: internal MultisigWallet SDK
  public abstract isOutdated(wallet: MultisigWallet): Promise<boolean>;
  // TODO: internal MultisigWallet SDK
  public abstract updateWallet(wallet: MultisigWallet): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  >;
  // TODO: internal MultisigWallet SDK
  public abstract getUpdateWalletMessage({
    wallet,
    codeIds,
  }: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message;

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

  // TODO: internal MultisigWallet SDK
  public abstract updateOwner({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  >;

  // TODO: internal MultisigWallet SDK
  public abstract getProposeUpdateOwnerMessage({
    wallet,
    newOwner,
    codeIds,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message;

  // TODO: internal MultisigWallet SDK
  public abstract updateGatekeeperConfig({
    wallet,
    newGatekeeperConfig,
  }: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
  }): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  >;

  // TODO: internal MultisigWallet SDK
  public abstract getUpdateGatekeeperMessages({
    wallet,
    newGatekeeperConfig,
    spendLimitGatekeeper,
    sessionKeyGatekeeper,
  }: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
    sessionKeyGatekeeper: string;
  }): Message[];

  // TODO: internal MultisigWallet SDK
  public abstract getConfirmUpdateOwnerMessage({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message;

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

  // TODO: internal Wallets SDK
  public abstract getCreateWalletMessage(multisigKey: MultisigKey): Message;

  // TODO: internal MultisigWallet SDK
  public abstract stake({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  >;

  // TODO: internal MultisigWallet SD
  public abstract unstake({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  >;

  // TODO: internal MultisigWallet SDK
  public abstract withdrawRewards(
    wallet: MultisigWallet
  ): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  >;

  // TODO: internal MultisigWallet SDK
  public abstract getStakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message;

  // TODO: internal MultisigWallet SDK
  public abstract getUnstakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message;

  // TODO: internal MultisigWallet SDK
  public abstract getWithdrawRewardsMessage({
    wallet,
    validator,
  }: {
    wallet: MultisigWallet;
    validator: string;
  }): Message;

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
