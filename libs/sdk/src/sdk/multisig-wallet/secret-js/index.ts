import warning from "tiny-warning";

import { SecretJsChainId } from "../../../chains/secret-js";
import {
  FlexAccount,
  MultisigKey,
  MultisigWallet,
} from "../../../data-structures";
import { Signer } from "../../../signers";
import { Message, SignedTransaction } from "../../../transactions";
import { BroadcastTransactionResult, CodeIds, Token } from "../../common";
import {
  AbstractMultisigWalletSdk,
  UpdateGatekeeperConfigParams,
} from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class SecretJsMultisigWalletSdk extends AbstractMultisigWalletSdk {
  protected override chainId: SecretJsChainId;

  public constructor({
    chainId,
    wallet,
  }: {
    chainId: SecretJsChainId;
    wallet: MultisigWallet;
  }) {
    super({ chainId, wallet });
    this.chainId = chainId;
  }

  protected async codeIdsQueryFn(): Promise<CodeIds> {
    notImplemented("codeIdsQueryFn not implemented for SecretJS");
    return {
      // TODO:
      userAccount: 1337,
      spendLimitGatekeeper: null,
      debtGatekeeper: null,
    };
  }

  protected async isOutdatedQueryFn(): Promise<boolean> {
    notImplemented("isOutdatedQueryFn not implemented for SecretJS");
    return false;
  }

  public async updateWallet(): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateWallet not implemented for SecretJS");
    return { approved: false };
  }

  public async updateOwner(_: MultisigKey): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateOwner not implemented for SecretJS");
    return { approved: false };
  }

  public async proposedOwner() {
    notImplemented("proposedOwner not implemented for SecretJS");
    return null;
  }

  public async updateGatekeeperConfig(_: UpdateGatekeeperConfigParams): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateGatekeeperConfig not implemented for SecretJS");
    return { approved: false };
  }

  public async stake(_: {
    amount: Token;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("stake not implemented for SecretJS");
    return { approved: false };
  }

  public async unstake(_: {
    amount: Token;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("unstake not implemented for SecretJS");
    return { approved: false };
  }

  public async withdrawRewards(): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("withdrawRewards not implemented for SecretJS");
    return { approved: false };
  }

  public async canExecute(_: {
    flexAccount: FlexAccount;
    messages: Message[];
  }): Promise<boolean> {
    notImplemented("canExecute not implemented for SecretJS");
    return false;
  }

  public async createAndSignTransaction(_: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction> {
    notImplemented("createAndSignTransaction not implemented for SecretJS");
    return new Uint8Array();
  }

  public async broadcastSignedTransaction(
    _signedTransaction: SignedTransaction,
  ): Promise<BroadcastTransactionResult> {
    notImplemented("broadcastSignedTransaction not implemented for SecretJS");
    return {
      success: false,
      transactionHash: "",
      rawResult: "",
    };
  }
}
