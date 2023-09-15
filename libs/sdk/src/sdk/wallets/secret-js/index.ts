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
  public async createWallet({
    multisigKey,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<
    | { homeAccountAddress: string }
    | AbstractUserInteractionResponse<
        { proxyAddress: string },
        { description: string; originalPayload: BroadcastTransactionResult }
      >
  > {
    const chainId = multisigKey.chainId;
    invariant(isSecretJsChain(chainId), "Expected Secret.js chain");

    const messagesSdk = Messages.chainId(chainId);
    const sdk = Sdk.chainId(chainId);

    const zAuthKey = multisigKey.getKeyOfType(KeyType.ZAuth);
    const deviceKey = multisigKey.getUsableKeyOfType(KeyType.Device);
    invariant(
      zAuthKey || deviceKey,
      "Expected ZAuth or device key to be present",
    );

    let signer, address;
    if (zAuthKey) {
      signer = new ZAuthKeySigner(zAuthKey);
      address = Sdk.chainId(chainId).transactions.getAddressOfPublicKey(
        zAuthKey.publicKey,
      );
    } else if (deviceKey) {
      invariant(deviceKey.payload?.privateKey, "Device key inaccessible");
      signer = new Secp256k1PrivateKeySigner(deviceKey.payload?.privateKey);
      address = Sdk.chainId(chainId).transactions.getAddressOfPublicKey(
        deviceKey.publicKey,
      );
    } else {
      throw new Error("Expected ZAuth or device key to be present");
    }

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
