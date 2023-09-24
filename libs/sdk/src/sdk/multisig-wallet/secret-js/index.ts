// eslint-disable-next-line @nx/enforce-module-boundaries
import { SecretJsClient } from "libs/sdk/src/clients";
import warning from "tiny-warning";

import { SecretJsChainId, secretJsChains } from "../../../chains/secret-js";
import {
  FlexAccount,
  MultisigKey,
  MultisigWallet,
} from "../../../data-structures";
import { Secp256k1PrivateKeySigner, Signer } from "../../../signers";
import { Message, SignedTransaction } from "../../../transactions";
import { BroadcastTransactionResult, CodeIds, Token } from "../../common";
import { Messages } from "../../messages";
import { SecretJsMessages } from "../../messages/secret-js";
import {
  AbstractMultisigWalletSdk,
  UpdateGatekeeperConfigParams,
} from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class SecretJsMultisigWalletSdk extends AbstractMultisigWalletSdk {
  protected override chainId: SecretJsChainId;
  protected userAccountAddress: string;
  protected userAccountCodeHash: string;

  public constructor({
    chainId,
    wallet,
  }: {
    chainId: SecretJsChainId;
    wallet: MultisigWallet;
  }) {
    super({ chainId, wallet });
    this.chainId = chainId;
    this.userAccountAddress = "";
    this.userAccountCodeHash = "";
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

  public async updateOwner(
    newOwner: MultisigKey,
    oldSigner: Secp256k1PrivateKeySigner,
    newSigner: Secp256k1PrivateKeySigner,
  ): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    if ((await this.proposedOwner()) !== newOwner.address) {
      const response = await this.proposeUpdateOwner(newOwner, oldSigner);

      if (!response.approved || !response.payload.success) {
        return response;
      }
    }

    return await this.confirmUpdateOwner(newOwner, newSigner);
  }

  public async getUserAccountAddress() {
    const client = new SecretJsClient("secret-4");
    if (!this.userAccountAddress || !this.userAccountCodeHash) {
      const chain = secretJsChains["secret-4"];
      const res: {
        user_account_address: string;
        user_account_code_hash: string;
      } = await client.withSecretNetworkClient(async (client) => {
        return await client.query.compute.queryContract({
          contract_address: this.wallet.proxyAddress,
          code_hash: chain.userEntry.codeHash,
          query: { user_account_address: {} },
        });
      });
      return res;
    } else {
      return {
        user_account_address: this.userAccountAddress,
        user_account_code_hash: this.userAccountCodeHash,
      };
    }
  }

  public async proposedOwner() {
    try {
      const client = new SecretJsClient("secret-4");
      const response: {
        pending_owner: string;
      } = await client.withSecretNetworkClient(async (client) => {
        const userAccountAddress = await this.getUserAccountAddress();
        const res: {
          pending_owner: string;
        } = await client.query.compute.queryContract({
          contract_address: userAccountAddress.user_account_address,
          code_hash: userAccountAddress.user_account_code_hash,
          query: { pending_owner: {} },
        });
        return res;
      });
      return response.pending_owner;
    } catch (e) {
      return null;
    }
  }

  protected async proposeUpdateOwner(
    newOwner: MultisigKey,
    signer: Secp256k1PrivateKeySigner,
  ): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    // const codeIds = await
    // queryClient.ensureQueryData(this.codeIdsQuery());
    const userAccountAddress = await this.getUserAccountAddress();
    const message = this.messages.getProposeUpdateOwnerMessage({
      wallet: this.wallet,
      newOwner,
      userAccountAddress: userAccountAddress.user_account_address,
      userAccountCodeHash: userAccountAddress.user_account_code_hash,
      // codeIds,
    });
    const nextHashResponse: {
      next_hash: string;
    } = await new SecretJsClient("secret-4").withSecretNetworkClient(
      async (client) => {
        return await client.query.compute.queryContract({
          contract_address: userAccountAddress.user_account_address,
          code_hash: userAccountAddress.user_account_code_hash,
          query: { next_hash: {} },
        });
      },
    );
    const nextHash = nextHashResponse.next_hash;
    /// hack for now; sign single. Pass in some active pk signer
    const activeSignature = await signer.signHash(Buffer.from(nextHash, "hex"));
    const proposeUpdateResponse = await fetch(
      "/api/proxy/presigned-transaction",
      {
        method: "POST",
        body: JSON.stringify({
          message,
          userAccountAddress: userAccountAddress.user_account_address,
          userAccountCodeHash: userAccountAddress.user_account_code_hash,
          nexthashSignedBySigners: [
            Buffer.from(activeSignature).toString("hex"),
          ],
        }),
      },
    );

    const proposeUpdateResponseJson = await proposeUpdateResponse.json();
    console.log(
      "propose-update-owner response: " +
        JSON.stringify(proposeUpdateResponseJson),
    );

    /*
    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      demoMode: this.wallet.isDemo,
      cancelable: true,
      multisigKey: this.wallet.owner,
    });
    */

    /* if (!response.approved) {
      return { approved: false };
    } */

    if (!proposeUpdateResponseJson.payload.success) {
      console.error(proposeUpdateResponseJson);
      return await this.proposeUpdateOwner(newOwner, signer);
    }

    return proposeUpdateResponseJson;
  }

  protected async confirmUpdateOwner(
    newOwner: MultisigKey,
    signer: Secp256k1PrivateKeySigner,
  ): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const userAccountAddress = await this.getUserAccountAddress();
    const message = this.messages.getConfirmUpdateOwnerMessage({
      wallet: this.wallet,
      newOwner,
      userAccountAddress: userAccountAddress.user_account_address,
      userAccountCodeHash: userAccountAddress.user_account_code_hash,
      // codeIds,
    });
    const nextHashResponse: {
      next_hash: string;
    } = await new SecretJsClient("secret-4").withSecretNetworkClient(
      async (client) => {
        return await client.query.compute.queryContract({
          contract_address: userAccountAddress.user_account_address,
          code_hash: userAccountAddress.user_account_code_hash,
          query: { next_hash: {} },
        });
      },
    );
    const nextHash = nextHashResponse.next_hash;
    /// hack for now; sign single. Pass in some active pk signer
    const activeSignature = await signer.signHash(Buffer.from(nextHash, "hex"));
    const confirmUpdateResponse = await fetch(
      "/api/proxy/presigned-transaction",
      {
        method: "POST",
        body: JSON.stringify({
          message,
          userAccountAddress: userAccountAddress.user_account_address,
          userAccountCodeHash: userAccountAddress.user_account_code_hash,
          nexthashSignedBySigners: [
            Buffer.from(activeSignature).toString("hex"),
          ],
        }),
      },
    );

    const confirmUpdateResponseJson = await confirmUpdateResponse.json();
    console.log(
      "confirm-update-owner response: " +
        JSON.stringify(confirmUpdateResponseJson),
    );

    /*
    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      demoMode: this.wallet.isDemo,
      cancelable: true,
      multisigKey: this.wallet.owner,
    });
    */

    /* if (!response.approved) {
      return { approved: false };
    } */

    if (!confirmUpdateResponseJson.payload.success) {
      console.error(confirmUpdateResponseJson);
      return await this.proposeUpdateOwner(newOwner, signer);
    }

    return confirmUpdateResponseJson;
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

  protected get messages() {
    return Messages.chainId("secret-4") as SecretJsMessages;
  }
}
