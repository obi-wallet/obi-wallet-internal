import invariant from "tiny-invariant";
import warning from "tiny-warning";

import {
  SecretJsChainId,
  SecretJsChainIds,
  SecretJsChains,
} from "../../../chains/secret-js";
import { SecretJsClient } from "../../../clients/secret-js";
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
  KeyType,
  SerializedProxyWallet,
} from "../../wallets/secret-js-msig/types";
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
    evmSigningAddress: string,
    evmUserContractAddress: string,
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
    const chain = SecretJsChains[SecretJsChainIds.MAINNET];
    const proxyWallet: SerializedProxyWallet = {
      proxyAddress: {
        address: this.wallet.proxyAddress,
        codeId: chain.currentCodeIds.userAccount,
      },
      evmUserContractAddress: evmUserContractAddress,
      evmSigningAddress: evmSigningAddress,
      owner: {
        threshold: String(newOwner.threshold),
        keys: newOwner.keys.map(({ type, publicKey }) => {
          if (!Object.values(KeyType).includes(type as KeyType)) {
            throw new Error(`Invalid key type: ${type}`);
          }
          return {
            type: type as KeyType,
            publicKey,
          };
        }),
      },
    };
    const response = await this.confirmUpdateOwner(newOwner, newSigner);
    if (response.approved && response.payload.success) {
      const _cloudflareResponse = await fetch(
        `https://proxy-wallets.obiwallet.workers.dev/add`,
        // `http://127.0.0.1:8787/add`,
        {
          method: "POST",
          body: JSON.stringify({
            chainId: SecretJsChainIds.MAINNET,
            proxyWallet,
          }),
          headers: {
            "Api-Version": "v1",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
          },
        },
      );
      return {
        approved: true,
        payload: { success: true },
      };
    } else {
      return {
        approved: false,
      };
    }
  }

  public async getUserAccountAddress() {
    const client = new SecretJsClient(SecretJsChainIds.MAINNET);
    if (!this.userAccountAddress || !this.userAccountCodeHash) {
      const chain = SecretJsChains[SecretJsChainIds.MAINNET];
      const res: {
        user_account_address: string;
        user_account_code_hash: string;
      } = await client.withSecretNetworkClient(async (client) => {
        let res: {
          user_account_address: string;
          user_account_code_hash: string;
        };
        try {
          res = await client.query.compute.queryContract({
            contract_address: this.wallet.proxyAddress,
            code_hash: chain.userEntry.codeHash,
            query: { user_account_address: {} },
          });
          invariant(res.user_account_address, "no user account address");
        } catch (e) {
          res = await client.query.compute.queryContract({
            contract_address: this.wallet.proxyAddress,
            query: { user_account_address: {} },
          });
        }
        return res;
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
      const client = new SecretJsClient(SecretJsChainIds.MAINNET);
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
    console.log("querying for user account address...");
    const userAccountAddress = await this.getUserAccountAddress();
    const nextHashResponse: {
      next_hash: string;
    } = await new SecretJsClient(
      SecretJsChainIds.MAINNET,
    ).withSecretNetworkClient(async (client) => {
      return await client.query.compute.queryContract({
        contract_address: userAccountAddress.user_account_address,
        code_hash: userAccountAddress.user_account_code_hash,
        query: { next_hash: {} },
      });
    });
    console.log("next hash response:" + JSON.stringify(nextHashResponse));
    const nextHash = nextHashResponse.next_hash;
    /// hack for now; sign single. Pass in some active pk signer
    const activeSignature = await signer.signHash(Buffer.from(nextHash, "hex"));
    console.log("assembling propose update owner message...");
    const message = this.messages.getProposeUpdateOwnerMessage({
      wallet: this.wallet,
      newOwner,
      userAccountAddress: userAccountAddress.user_account_address,
      userAccountCodeHash: userAccountAddress.user_account_code_hash,
      nexthashSignedBySigners: [Buffer.from(activeSignature).toString("hex")],
      // codeIds,
    });
    console.log("propose update owner message: " + JSON.stringify(message));

    const proposeUpdateResponse = await fetch(
      "/api/proxy/presigned-transaction",
      {
        method: "POST",
        body: JSON.stringify({
          message,
          userAccountAddress: userAccountAddress.user_account_address,
          userAccountCodeHash: userAccountAddress.user_account_code_hash,
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

    if (!proposeUpdateResponseJson.success) {
      console.error(proposeUpdateResponseJson);
      return await this.proposeUpdateOwner(newOwner, signer);
    }

    return {
      approved: true,
      payload: { success: true },
    };
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
    const nextHashResponse: {
      next_hash: string;
    } = await new SecretJsClient(
      SecretJsChainIds.MAINNET,
    ).withSecretNetworkClient(async (client) => {
      return await client.query.compute.queryContract({
        contract_address: userAccountAddress.user_account_address,
        code_hash: userAccountAddress.user_account_code_hash,
        query: { next_hash: {} },
      });
    });
    const nextHash = nextHashResponse.next_hash;
    /// hack for now; sign single. Pass in some active pk signer
    const activeSignature = await signer.signHash(Buffer.from(nextHash, "hex"));

    const message = this.messages.getConfirmUpdateOwnerMessage({
      wallet: this.wallet,
      newOwner,
      userAccountAddress: userAccountAddress.user_account_address,
      userAccountCodeHash: userAccountAddress.user_account_code_hash,
      nexthashSignedBySigners: [Buffer.from(activeSignature).toString("hex")],
    });
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

    if (!confirmUpdateResponseJson.success) {
      console.error(confirmUpdateResponseJson);
      return await this.confirmUpdateOwner(newOwner, signer);
    }

    return {
      approved: true,
      payload: { success: true },
    };
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
    return Messages.chainId(SecretJsChainIds.MAINNET) as SecretJsMessages;
  }
}
