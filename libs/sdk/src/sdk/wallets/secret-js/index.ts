import { TxResponse } from "secretjs";
import invariant from "tiny-invariant";

import { AccountValidationResult, Sdk } from "../..";
import { isSecretJsChain } from "../../../chains";
import { SecretJsClient } from "../../../clients";
import { KeyType, MultisigKey } from "../../../data-structures";
import { Secp256k1PrivateKeySigner, ZAuthKeySigner } from "../../../signers";
import { AbstractUserInteractionResponse } from "../../../user-interactions/abstract";
import { BroadcastTransactionResult } from "../../common";
import { Messages } from "../../messages";
import { AbstractWalletsSdk } from "../abstract";

export class SecretJsWalletsSdk extends AbstractWalletsSdk {
  /// Creates a home chain account for the user owned by `multisigKey.`
  /// Also adds a new simple signer key that is owned by the multisig.
  public async createHomeWalletAndAddKey({
    multisigKey,
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
  > {
    const chainId = multisigKey.chainId;
    invariant(isSecretJsChain(chainId), "Expected Secret.js chain");

    const messagesSdk = Messages.chainId(chainId);
    const sdk = Sdk.chainId(chainId);

    console.log("Creating new multisig account owned by multisig key: " + JSON.stringify(multisigKey, null, 2));
    
    /// Here we need to do three things:
    /// 1. generate an ETH keypair
    /// 2. create a home account (signed by secret multisig signer)
    /// 3. add the ETH keypair to the simple signer

    const client = new SecretJsClient(chainId);

    const accountValidationResult = await sdk.transactions.validateAccount(
      address,
    );
    if (accountValidationResult < AccountValidationResult.ACCOUNT_NOT_READY) {
      console.log("Need to prepare account", address);
      return {
        approved: false,
      };
    }

    const signedTransaction = await client.createAndSignTransaction({
      signer,
      messages: [messagesSdk.getCreateWalletMessage(multisigKey)],
    });
    const broadcastTransactionResult = await client.broadcastSignedTransaction(
      signedTransaction,
    );

    if (!broadcastTransactionResult.success) {
      return {
        approved: true,
        payload: {
          success: false,
          description: "Transaction failed",
          originalPayload: broadcastTransactionResult,
        },
      };
    }

    const response = broadcastTransactionResult.rawResult as TxResponse;
    try {
      const contractAddress = response.arrayLog?.find((log) => {
        return log.type === "instantiate" && log.key === "contract_address";
      })?.value;

      invariant(contractAddress, "No contract address found");

      return {
        approved: true,
        payload: {
          success: true,
          proxyAddress: contractAddress,
        },
      };
    } catch (e) {
      console.log("original error", e);
      return {
        approved: true,
        payload: {
          success: false,
          description: "Could not parse log",
          originalPayload: broadcastTransactionResult,
        },
      };
    }
  }
}
