import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/feather.js";
import { BaseAccount } from "cosmjs-types/cosmos/auth/v1beta1/auth";
import { WalletMeta } from "libs/sdk/src/data-structures";
import { Account } from "secretjs";
import invariant from "tiny-invariant";
import warning from "tiny-warning";
import { string } from "zod";

import { EthTransaction, SecretJsMultisigSigner } from "./multisigs-signer";
import { SecretJsChainId, secretJsChains } from "../../../chains";
import { SecretJsClient } from "../../../clients";
import { MultisigPublicKey, PublicKey, Secp256k1KeyPair } from "../../../keys";
import { Message, SignedTransaction } from "../../../transactions";
import {
  AccountValidationResult,
  BroadcastTransactionResult,
  RpcError,
} from "../../common";
import { Messages } from "../../messages";
import { CosmosSdkMessages } from "../../messages/cosmos-sdk";
import { AbstractTransactionsSdk } from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class SecretJsTransactionsSdk extends AbstractTransactionsSdk {
  protected override chainId: SecretJsChainId;
  protected client: SecretJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: SecretJsChainId;
    client: SecretJsClient;
  }) {
    super(chainId);
    this.chainId = chainId;
    this.client = client;
  }

  public getAddressOfPublicKey(publicKey: PublicKey) {
    switch (publicKey.type) {
      case "tendermint/PubKeySecp256k1":
        return SimplePublicKey.fromAmino(publicKey).address(this.chain.prefix);
      case "tendermint/PubKeyMultisigThreshold":
        return LegacyAminoMultisigPublicKey.fromAmino(publicKey).address(
          this.chain.prefix,
        );
      default:
        throw new Error("Unsupported public key type");
    }
  }

  public async getPublicKeyOfAddress(address: string): Promise<unknown | null> {
    try {
      const account = await this.fetchAccount(address);
      if (!account || !this.isBaseAccount(account)) return null;
      return account.pubKey ?? null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public validateAddress(address: string): boolean {
    try {
      Bech32Address.validate(address, this.chain.prefix);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async validateAccount(
    address: string,
  ): Promise<AccountValidationResult> {
    if (!this.validateAddress(address)) {
      return AccountValidationResult.INVALID_ADDRESS;
    }
    const account = await this.fetchAccount(address);
    if (!account || !this.isBaseAccount(account)) {
      return AccountValidationResult.ACCOUNT_NOT_READY;
    }
    if (!account.pubKey || account.sequence.equals(0)) {
      return AccountValidationResult.PUBLIC_KEY_NOT_READY;
    }
    return AccountValidationResult.READY;
  }

  protected async prepareKeyPairQueryFn(_: Secp256k1KeyPair) {
    notImplemented("prepareKeyPairQueryFn not implemented for SecretJS");
  }

  protected isBaseAccount(account: Account): account is Account & BaseAccount {
    return account["@type"] === "/cosmos.auth.v1beta1.BaseAccount";
  }

  protected async fetchAccount(address: string) {
    return await this.client.withSecretNetworkClient(async (client) => {
      try {
        const { account } = await client.query.auth.account({
          address,
        });
        return account;
      } catch (e) {
        const result = RpcError.safeParse(e);
        if (result.success && result.data.message.includes("code = NotFound")) {
          return null;
        }
        throw e;
      }
    });
  }

  public async createMultisigSigner({
    multisigPublicKey,
    messages,
    walletMeta,
    evmSigningAddress,
  }: {
    multisigPublicKey: MultisigPublicKey;
    messages: Message[];
    walletMeta?: WalletMeta;
    evmSigningAddress?: string;
  }) {
    const address = this.getAddressOfPublicKey(multisigPublicKey);
    await this.prepareAccount(address);
    const account = await this.fetchAccount(address);
    invariant(account, "Account not found.");
    invariant(this.isBaseAccount(account), "account is not BaseAccount");
    const baseAccount = account as Account & BaseAccount;

    const aminoMessages = messages.map((message) => {
      return this.messages.toJSON(message);
    });
    const checkMessages: any[] = aminoMessages;
    console.log("aminoMessages is: " + JSON.stringify(aminoMessages));
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (checkMessages[0].raw || checkMessages[0].eth) {
      invariant(
        aminoMessages.length === 1,
        "Only one message supported for raw signing",
      );
      console.log("triggering raw/eth is yes");
      console.log("checkMessages[0].eth is " + JSON.stringify(checkMessages[0].eth));
      const signer = new SecretJsMultisigSigner({
        chainId: this.chainId,
        account,
        accountNumber: baseAccount.accountNumber,
        sequence: baseAccount.sequence,
        fee: this.client.defaultFee,
        encodeObjects: undefined,
        /* eslint-disable @typescript-eslint/no-explicit-any */
        messages: [
          {
            type: checkMessages[0].raw ? "raw" : "eth",
            value: checkMessages[0].raw
              ?  checkMessages[0].raw
              :  checkMessages[0].eth,
          },
        ],
        multisigPublicKey,
      });
      console.log("partly prepared signer is " + JSON.stringify(signer));
      if (checkMessages[0].eth) {
        invariant(evmSigningAddress, "no evmSigningAddress provided");
        invariant(walletMeta, "no walletMeta provided");
        console.log("getSignUserOpInput is " + signer.getSignUserOpInput());
        if (!signer.getSignUserOpInput() && !signer.getSignMessage()) {
          console.log("calling initUserOperation...");
          await signer.initUserOperation(evmSigningAddress, walletMeta);
        } else {
          console.log("signMessage is " + signer.getSignMessage());
        }
      }
      return signer;
    } else {
      const encodeObjects = aminoMessages.map((aminoMessage) => {
        return this.client.aminoTypes.fromAmino(aminoMessage);
      });
      return new SecretJsMultisigSigner({
        chainId: this.chainId,
        account,
        accountNumber: baseAccount.accountNumber,
        sequence: baseAccount.sequence,
        fee: this.client.defaultFee,
        encodeObjects,
        messages: aminoMessages,
        multisigPublicKey,
      });
    }
  }

  public async broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }): Promise<BroadcastTransactionResult> {
    return await this.client.broadcastSignedTransaction(signedTransaction);
  }

  public async broadcastSignedTransactionAndLendFees({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
    sender: string;
  }): Promise<BroadcastTransactionResult> {
    notImplemented(
      "broadcastSignedTransactionAndLendFees not implemented for SecretJS",
    );
    return await this.broadcastSignedTransaction({
      signedTransaction,
    });
  }

  protected get chain() {
    return secretJsChains[this.chainId];
  }

  protected get messages() {
    return Messages.chainId(this.chainId) as CosmosSdkMessages;
  }
}
