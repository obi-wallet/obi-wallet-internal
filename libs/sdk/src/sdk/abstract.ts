import fetch from "isomorphic-unfetch";
import invariant from "tiny-invariant";

import {
  AccountValidationResult,
  BroadcastTransactionResult,
  CodeIds,
  Coin,
  Delegation,
  EnrichedValidator,
  GatekeeperContractAddresses,
  PermissionedAddress,
  Rewards,
  UnbondingDelegation,
} from "./common";
import { Chain } from "../chains";
import { MultisigKey, MultisigWallet } from "../data-structures";
import { MultisigPublicKey, PublicKey } from "../keys";
import { MultisigSigner, Signer } from "../signers";
import { Message, SignedTransaction } from "../transactions";
import {
  AbstractUserInteractionResponse,
  UserInteraction,
} from "../user-interactions/abstract";

export abstract class AbstractSdk {
  protected constructor(protected chainId: Chain) {}

  public abstract validateAddress({ address }: { address: string }): boolean;
  public abstract validateAccount({
    address,
  }: {
    address: string;
  }): Promise<AccountValidationResult>;
  public async prepareAccount({ address }: { address: string }): Promise<void> {
    const validationResult = await this.validateAccount({ address });
    invariant(
      validationResult !== AccountValidationResult.INVALID_ADDRESS,
      "Invalid address"
    );

    if (validationResult <= AccountValidationResult.ACCOUNT_NOT_READY) {
      await this.lendFees({ address });
      while (
        (await this.validateAccount({ address })) <=
        AccountValidationResult.ACCOUNT_NOT_READY
      ) {
        await this.wait({ ms: 100 });
      }
    }
  }
  public abstract prepareSigner({ signer }: { signer: Signer }): Promise<void>;

  public abstract fetchPrices(): Promise<Record<string, number>>;
  public abstract fetchBalances({
    address,
  }: {
    address: string;
  }): Promise<Coin[]>;

  public abstract fetchDelegations({
    address,
  }: {
    address: string;
  }): Promise<Delegation[]>;
  public abstract fetchUnbondingDelegations({
    address,
  }: {
    address: string;
  }): Promise<UnbondingDelegation[]>;
  public abstract fetchValidators(): Promise<EnrichedValidator[]>;
  public abstract fetchRewards({
    address,
  }: {
    address: string;
  }): Promise<Rewards>;

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

  public abstract fetchGatekeeperContractAddresses({
    proxyAddress,
  }: {
    proxyAddress: string;
  }): Promise<GatekeeperContractAddresses>;
  public abstract fetchPermissionedAddresses({
    spendLimitGatekeeper,
  }: {
    spendLimitGatekeeper: string;
  }): Promise<PermissionedAddress[]>;

  protected async lendFees({ address }: { address: string }) {
    invariant(this.validateAddress({ address }), "Invalid address");
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

  public abstract getAddressOfPublicKey({
    publicKey,
  }: {
    publicKey: PublicKey;
  }): string;

  public getAddressOfSigner({ signer }: { signer: Signer }): string {
    return this.getAddressOfPublicKey({ publicKey: signer.publicKey });
  }

  public abstract createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction>;

  public abstract createMultisigSigner({
    multisigPublicKey,
    messages,
  }: {
    multisigPublicKey: MultisigPublicKey;
    messages: Message[];
  }): Promise<MultisigSigner>;

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

  public abstract broadcastSignedTransactionAndLendFees({
    signedTransaction,
    sender,
  }: {
    signedTransaction: SignedTransaction;
    sender: string;
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

  protected wait({ ms }: { ms: number }): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
