import fetch from "isomorphic-unfetch";
import invariant from "tiny-invariant";

import { Chain } from "../../chains";
import { MultisigPublicKey, PublicKey, Secp256k1KeyPair } from "../../keys";
import { QueryClientNamespace } from "../../query-client";
import { MultisigSigner } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AccountValidationResult, BroadcastTransactionResult } from "../common";

export abstract class AbstractTransactionsSdk {
  protected queryNamespace: QueryClientNamespace<
    "transactions-sdk",
    { chainId: Chain }
  >;

  protected constructor(protected chainId: Chain) {
    this.queryNamespace = new QueryClientNamespace("transactions-sdk", {
      chainId,
    });
  }

  public abstract getAddressOfPublicKey(publicKey: PublicKey): string;

  public abstract validateAddress(address: string): boolean;

  public abstract validateAccount(
    address: string
  ): Promise<AccountValidationResult>;

  // TODO: possibly call in Sec256k1PrivateKeySigner
  public abstract prepareKeyPair(keyPair: Secp256k1KeyPair): Promise<void>;

  public async prepareAccount(address: string): Promise<void> {
    const validationResult = await this.validateAccount(address);
    invariant(
      validationResult !== AccountValidationResult.INVALID_ADDRESS,
      "Invalid address"
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

  public abstract createMultisigSigner({
    multisigPublicKey,
    messages,
  }: {
    multisigPublicKey: MultisigPublicKey;
    messages: Message[];
  }): Promise<MultisigSigner>;

  public abstract broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }): Promise<BroadcastTransactionResult>;

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
      }
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
