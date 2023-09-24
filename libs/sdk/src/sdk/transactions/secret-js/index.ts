import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/feather.js";
import { BaseAccount } from "cosmjs-types/cosmos/auth/v1beta1/auth";
import { Account, AminoMsg } from "secretjs";
import invariant from "tiny-invariant";
import warning from "tiny-warning";

import { SecretJsMultisigSigner } from "./multisigs-signer";
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
import { AbstractTransactionsSdk } from "../abstract";
import { SecretJsMessages } from "../../messages/secret-js";
import { AuthInfo, TxRaw } from "secretjs/dist/protobuf/cosmos/tx/v1beta1/tx";
import { Coin } from "secretjs/dist/grpc_gateway/cosmos/base/v1beta1/coin.pb";

export * from "./extended-ethers-signer";

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
  }: {
    multisigPublicKey: MultisigPublicKey;
    messages: Message[];
  }) {
    const address = this.getAddressOfPublicKey(multisigPublicKey);
    await this.prepareAccount(address);
    const account = await this.fetchAccount(address);
    invariant(account, "Account not found.");
    invariant(this.isBaseAccount(account), "account is not BaseAccount");
    const stockClient = await this.client.withSecretNetworkClient((client) => {
      return client;
    });
    const aminoMessagesPromises = messages.map((message) => this.messages.toJSON(message, stockClient));
    const aminoMessages = await Promise.all(aminoMessagesPromises);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const checkMessages: any[] = aminoMessages;
    console.log("aminoMessages is: " + JSON.stringify(aminoMessages));
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (checkMessages[0].raw || checkMessages[0].eth || checkMessages[0].hash) {
      invariant(
        aminoMessages.length === 1,
        "Only one message supported for raw/eth/hash signing",
      );
      console.log("triggering raw/eth/hash is yes");
      console.log(
        "checkMessages[0].hash is " + JSON.stringify(checkMessages[0].hash),
      );
      const { raw, hash, eth } = checkMessages[0];

      const type = raw ? "raw" : hash ? "hash" : "eth";
      const value = raw || hash || eth;

      const messages = [{ type, value }];
      const signer = new SecretJsMultisigSigner({
        chainId: this.chainId,
        account,
        fee: this.client.defaultFee,
        encodeObjects: undefined,
        /* eslint-disable @typescript-eslint/no-explicit-any */
        messages,
        multisigPublicKey,
      });
      console.log("partly prepared signer is " + JSON.stringify(signer));
      return signer;
    } else {
      console.log("in createMultisigSigner(), encoding messages...");
      const encodeObjects = aminoMessages.map((aminoMessage) => {
        if (!(aminoMessage as unknown as AminoMsg).type) {
          throw new Error("aminoMessage is not of type AminoMsg");
        }
        return {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: (aminoMessage as unknown as AminoMsg).value
        };
      });
      console.log("done in createMultisigSigner(), returning signer...");
      return new SecretJsMultisigSigner({
        chainId: this.chainId,
        account,
        fee: this.client.defaultFee,
        encodeObjects,
        messages: aminoMessages as unknown as AminoMsg[],
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

  protected async fetchBalance({
    address,
    denom,
  }: {
    address: string;
    denom: string;
  }): Promise<Coin | undefined> {
    const res = await this.client.withSecretNetworkClient(async (client) => {
      const res = await client.query.bank.balance({
        address: address,
        denom: "uscrt",
      });
      return res.balance;
    });
    return res;
  }

  public async broadcastSignedTransactionAndLendFees({
    signedTransaction,
    sender,
  }: {
    signedTransaction: SignedTransaction;
    sender: string;
  }): Promise<BroadcastTransactionResult> {
    const transaction = TxRaw.decode(signedTransaction);
    const { fee } = AuthInfo.decode(transaction.auth_info_bytes);

    /*
    const hasEnoughForFees = async () => {
      if (!fee) return true;
      invariant(fee.amount.length === 1, "fee.amount.length must be 1");
      const balance = await this.fetchBalance({
        address: sender,
        denom: fee.amount[0].denom,
      });
      return (
        balance &&
        parseInt(balance.amount!, 10) >= parseInt(fee.amount[0].amount, 10)
      );
    };

    while (!(await hasEnoughForFees())) {
      await this.lendFees(sender);
    }
    */
    console.log("signed transaction is: " + Buffer.from(signedTransaction).toString());
    return await this.broadcastSignedTransaction({ signedTransaction });
  }

  protected get chain() {
    return secretJsChains[this.chainId];
  }

  protected get messages() {
    return Messages.chainId(this.chainId) as SecretJsMessages;
  }
}

export * from "./extended-ethers-signer";
export * from "./multisigs-signer";
