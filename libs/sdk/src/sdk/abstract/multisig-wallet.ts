import { Chain } from "../../chains";
import {
  FlexAccount,
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { queryClient, QueryClientNamespace } from "../../query-client";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { BroadcastTransactionResult, CodeIds, Token } from "../common";

/**
 * Methods are proxied by {@link MultisigWallet}.
 *
 * @internal
 */
export abstract class AbstractMultisigWalletSdk {
  protected queryNamespace: QueryClientNamespace<
    "multisig-wallet-sdk",
    { chainId: Chain; proxyAddress: string }
  >;

  protected chainId: Chain;
  protected wallet: MultisigWallet;

  protected constructor({
    chainId,
    wallet,
  }: {
    chainId: Chain;
    wallet: MultisigWallet;
  }) {
    this.queryNamespace = new QueryClientNamespace("multisig-wallet-sdk", {
      chainId,
      proxyAddress: wallet.proxyAddress,
    });

    this.chainId = chainId;
    this.wallet = wallet;
  }

  public codeIds() {
    return queryClient.fetchQuery(this.codeIdsQuery());
  }

  public codeIdsQuery() {
    return this.queryNamespace.createQuery({
      name: "codeIds",
      fn: this.codeIdsQueryFn.bind(this),
    });
  }

  protected abstract codeIdsQueryFn(): Promise<CodeIds>;

  public isOutdated() {
    return queryClient.fetchQuery(this.isOutdatedQuery());
  }

  public isOutdatedQuery() {
    return this.queryNamespace.createQuery({
      name: "isOutdated",
      fn: this.isOutdatedQueryFn.bind(this),
    });
  }

  protected abstract isOutdatedQueryFn(): Promise<boolean>;

  public abstract updateWallet(): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  >;

  public abstract updateOwner(newOwner: MultisigKey): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  >;

  public abstract updateGatekeeperConfig(
    newGatekeeperConfig: GatekeeperConfig
  ): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  >;

  public abstract stake({
    amount,
    validator,
  }: {
    amount: Token;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  >;

  public abstract unstake({
    amount,
    validator,
  }: {
    amount: Token;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  >;

  public abstract withdrawRewards(): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  >;

  public abstract canExecute({
    flexAccount,
    messages,
  }: {
    flexAccount: FlexAccount;
    messages: Message[];
  }): Promise<boolean>;

  public abstract createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction>;

  public abstract broadcastSignedTransaction(
    signedTransaction: SignedTransaction
  ): Promise<BroadcastTransactionResult>;
}
