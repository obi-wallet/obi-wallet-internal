import {
  AccAddress,
  isTxError,
  LegacyAminoMultisigPublicKey,
  Msg,
  MsgSend,
  SimplePublicKey,
  Tx,
} from "@terra-money/feather.js";
import { AxiosError } from "axios";
import invariant from "tiny-invariant";

import { FeatherJsMultisigSigner } from "./multisig-signer";
import { TerraChainId, terraChains } from "../../../chains";
import { FeatherJsClient } from "../../../clients";
import { MultisigPublicKey, PublicKey, Secp256k1KeyPair } from "../../../keys";
import { Secp256k1PrivateKeySigner } from "../../../signers";
import { Message, SignedTransaction } from "../../../transactions";
import {
  AccountValidationResult,
  BroadcastTransactionResult,
  RpcError,
} from "../../common";
import { FeatherJsKey } from "../../common/feather-js";
import { AbstractTransactionsSdk } from "../abstract";

export class FeatherJsTransactionsSdk extends AbstractTransactionsSdk {
  protected override chainId: TerraChainId;
  protected client: FeatherJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: TerraChainId;
    client: FeatherJsClient;
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
          this.chain.prefix
        );
      default:
        throw new Error("Unsupported public key type");
    }
  }

  public async getPublicKeyOfAddress(address: string): Promise<unknown | null> {
    try {
      const account = await this.client.withClient(async (client) => {
        return await client.auth.accountInfo(address);
      });
      return account.getPublicKey()?.toAmino() ?? null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public validateAddress(address: string): boolean {
    return AccAddress.validate(address, this.chain.prefix);
  }

  public async validateAccount(
    address: string
  ): Promise<AccountValidationResult> {
    if (!this.validateAddress(address)) {
      return AccountValidationResult.INVALID_ADDRESS;
    }
    const account = await this.fetchAccount(address);
    if (!account) {
      return AccountValidationResult.ACCOUNT_NOT_READY;
    }
    if (!account.getPublicKey()) {
      return AccountValidationResult.PUBLIC_KEY_NOT_READY;
    }
    return AccountValidationResult.READY;
  }

  protected async prepareKeyPairQueryFn(keyPair: Secp256k1KeyPair) {
    const key = FeatherJsKey.fromSigner(
      new Secp256k1PrivateKeySigner(keyPair.privateKey)
    );
    const address = key.accAddress(this.chain.prefix);

    await this.prepareAccount(address);

    const validationResult = await this.validateAccount(address);
    invariant(
      validationResult >= AccountValidationResult.PUBLIC_KEY_NOT_READY,
      "Account not ready"
    );
    if (validationResult <= AccountValidationResult.PUBLIC_KEY_NOT_READY) {
      await this.client.withClient(async (client) => {
        const wallet = client.wallet(key);
        const { denom } = this.chain;
        const send = new MsgSend(address, address, { [denom]: 1 });
        const tx = await wallet.createAndSignTx({
          chainID: this.chainId,
          msgs: [send],
        });
        await client.tx.broadcastBlock(tx, this.chainId);
      });
      while (
        (await this.validateAccount(address)) <=
        AccountValidationResult.PUBLIC_KEY_NOT_READY
      ) {
        await this.wait({ ms: 100 });
      }
    }
  }

  protected async fetchAccount(address: string) {
    try {
      return await this.client.withClient(async (client) => {
        return await client.auth.accountInfo(address);
      });
    } catch (e) {
      const error = e as AxiosError;
      const data = error.response?.data;

      const result = RpcError.safeParse(data);
      if (
        error.response?.status === 404 &&
        result.success &&
        (result.data.message.includes("not found") ||
          result.data.message.includes("code = NotFound"))
      ) {
        return null;
      }

      throw e;
    }
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

    try {
      return await this.client.withClient(async (client) => {
        const transaction = await client.tx.create(
          [
            {
              address,
              sequenceNumber: account.getSequenceNumber(),
              publicKey: account.getPublicKey(),
            },
          ],
          {
            chainID: this.chainId,
            // TODO:
            msgs: messages as Msg[],
          }
        );
        return new FeatherJsMultisigSigner({
          chainId: this.chainId,
          account,
          transaction,
          multisigPublicKey,
        });
      });
    } catch (e) {
      const error = e as AxiosError;
      const data = error.response?.data;

      const result = RpcError.safeParse(data);
      if (result.success) {
        throw new Error(result.data.message);
      }

      throw e;
    }
  }

  public async broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }): Promise<BroadcastTransactionResult> {
    return await this.client.withClient(async (client) => {
      const transaction = Tx.fromBuffer(Buffer.from(signedTransaction));
      const rawResult = await client.tx.broadcastBlock(
        transaction,
        this.chainId
      );
      return {
        success: !isTxError(rawResult),
        transactionHash: rawResult.txhash,
        rawLog: rawResult.raw_log,
        rawResult,
      };
    });
  }

  public async broadcastSignedTransactionAndLendFees({
    signedTransaction,
    sender,
  }: {
    signedTransaction: SignedTransaction;
    sender: string;
  }): Promise<BroadcastTransactionResult> {
    const response = await this.broadcastSignedTransaction({
      signedTransaction,
    });
    if (response.success || !response.rawLog?.includes("insufficient funds")) {
      return response;
    }
    await this.lendFees(sender);
    return await this.broadcastSignedTransaction({ signedTransaction });
  }

  protected get chain() {
    return terraChains[this.chainId];
  }
}
