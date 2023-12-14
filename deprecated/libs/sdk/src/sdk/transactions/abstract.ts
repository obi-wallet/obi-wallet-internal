import fetch from "isomorphic-unfetch";
import invariant from "tiny-invariant";

import { ChainId } from "../../chains";
import { WalletMeta } from "../../data-structures";
import { MultisigPublicKey, PublicKey, Secp256k1KeyPair } from "../../keys";
import { queryClient, QueryClientNamespace } from "../../query-client";
import { MultisigSigner } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AccountValidationResult, BroadcastTransactionResult } from "../common";

export abstract class AbstractTransactionsSdk {
  protected queryNamespace: QueryClientNamespace<
    "transactions-sdk",
    { chainId: ChainId }
  >;

  protected constructor(protected chainId: ChainId) {
    this.queryNamespace = new QueryClientNamespace("transactions-sdk", {
      chainId,
    });
  }

  /**
   * Address of the given public key.
   */
  public abstract getAddressOfPublicKey(publicKey: PublicKey): string;

  /**
   * Public key of the given address
   */
  public abstract getPublicKeyOfAddress(
    address: string,
  ): Promise<unknown | null>;

  /**
   * Validates the given address
   */
  public abstract validateAddress(address: string): boolean;

  /**
   * Validates the account of the given address
   */
  public abstract validateAccount(
    address: string,
  ): Promise<AccountValidationResult>;

  /**
   * Prepares a key pair for signing transactions.
   *
   * @see {@link prepareKeyPairQuery} for usage with TanStack Query.
   */
  public prepareKeyPair(keyPair: Secp256k1KeyPair) {
    return queryClient.fetchQuery(this.prepareKeyPairQuery(keyPair));
  }

  public prepareKeyPairQuery(keyPair: Secp256k1KeyPair) {
    return this.queryNamespace.createQuery({
      name: "prepareKeyPair",
      fn: async (keyPair) => {
        await this.prepareKeyPairQueryFn(keyPair);
        return true;
      },
      params: keyPair,
      staleTime: { day: 1 },
    });
  }

  protected abstract prepareKeyPairQueryFn(
    keyPair: Secp256k1KeyPair,
  ): Promise<void>;

  /**
   * Prepares an account for signing transactions.
   */
  public async prepareAccount(address: string): Promise<void> {
    const validationResult = await this.validateAccount(address);
    invariant(
      validationResult !== AccountValidationResult.INVALID_ADDRESS,
      "Invalid address",
    );

    if (validationResult <= AccountValidationResult.ACCOUNT_NOT_READY) {
      await this.lendFees(address);
      while (
        (await this.validateAccount(address)) <=
        AccountValidationResult.ACCOUNT_NOT_READY
      ) {
        await this.wait({ ms: 100 });
      }
    }
  }

  /**
   * Creates a signer for a multisig transaction.
   */
  public abstract createMultisigSigner({
    multisigPublicKey,
    messages,
    evmSigningAddress,
    walletMeta,
  }: {
    multisigPublicKey: MultisigPublicKey;
    messages: Message[];
    evmSigningAddress?: string;
    walletMeta?: WalletMeta;
  }): Promise<MultisigSigner>;

  /**
   * Broadcasts a signed transaction.
   */
  public abstract broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }): Promise<BroadcastTransactionResult>;

  /**
   * Broadcasts a signed transaction and lends fees if necessary.
   */
  public abstract broadcastSignedTransactionAndLendFees({
    signedTransaction,
    sender,
  }: {
    signedTransaction: SignedTransaction;
    sender: string;
  }): Promise<BroadcastTransactionResult>;

  // TODO: mutation with retry
  protected async lendFees(address: string) {
    invariant(this.validateAddress(address), "Invalid address");
    const response = await fetch(
      "https://fee-lender-worker.obiwallet.workers.dev/",
      {
        method: "POST",
        body: `${this.chainId},${address}`,
      },
    );
    if (response.status !== 200) {
      console.log(response);
      throw new Error("Lending fees failed");
    }
  }

  protected wait({ ms }: { ms: number }): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
