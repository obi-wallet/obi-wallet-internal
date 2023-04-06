import { AbstractBankSdk } from "./bank";
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
export * from "./gatekeeper";
export * from "./staking";
export * from "./transactions";

export abstract class AbstractSdk {
  protected queryNamespace: QueryClientNamespace<"sdk", { chainId: Chain }>;

  public abstract bank: AbstractBankSdk;
  public abstract gatekeeper: AbstractGatekeeperSdk;
  public abstract staking: AbstractStakingSdk;
  public abstract transactions: AbstractTransactionsSdk;

  protected constructor(protected chainId: Chain) {
    this.queryNamespace = new QueryClientNamespace("sdk", { chainId });
  }

  public abstract fetchCodeId({
    contract,
  }: {
    contract: string;
  }): Promise<number>;
  public abstract fetchCodeIds(wallet: MultisigWallet): Promise<CodeIds>;
  public abstract isOutdated(wallet: MultisigWallet): Promise<boolean>;
  public abstract updateWallet(wallet: MultisigWallet): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  >;
  public abstract getUpdateWalletMessage({
    wallet,
    codeIds,
  }: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message;

  public abstract createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction>;

  public abstract canExecute({
    address,
    proxyAddress,
    messages,
  }: {
    address: string;
    proxyAddress: string;
    messages: Message[];
  }): Promise<boolean>;

  public abstract broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }): Promise<BroadcastTransactionResult>;

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

  public abstract getProposeUpdateOwnerMessage({
    wallet,
    newOwner,
    codeIds,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message;

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

  public abstract getConfirmUpdateOwnerMessage({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message;

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

  public abstract getCreateWalletMessage(multisigKey: MultisigKey): Message;

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

  public abstract withdrawRewards(
    wallet: MultisigWallet
  ): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  >;

  public abstract getStakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message;

  public abstract getUnstakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message;

  public abstract getWithdrawRewardsMessage({
    wallet,
    validator,
  }: {
    wallet: MultisigWallet;
    validator: string;
  }): Message;

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
