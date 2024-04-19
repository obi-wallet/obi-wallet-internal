import { Bech32Address } from "@keplr-wallet/cosmos";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/feather.js";
import { BaseAccount } from "cosmjs-types/cosmos/auth/v1beta1/auth";
import { Account } from "secretjs";
import warning from "tiny-warning";

import { SecretJsChainId, SecretJsChains } from "../../../chains";
import { SecretJsClient } from "../../../clients";
import { PublicKey } from "../../../keys";
import { SignedTransaction } from "../../../transactions";
import {
  AccountValidationResult,
  BroadcastTransactionResult,
  RpcError,
} from "../../common";
import { Messages } from "../../messages";
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
    if (!account.pubKey || account.sequence == 0n) {
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
    return SecretJsChains[this.chainId];
  }

  protected get messages() {
    return Messages.chainId(this.chainId);
  }
}
