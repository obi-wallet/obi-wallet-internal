import { pubkeyToAddress, StdFee } from "@cosmjs/amino";
import { createWasmAminoConverters } from "@cosmjs/cosmwasm-stargate";
import { coins } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  isDeliverTxSuccess,
} from "@cosmjs/stargate";
import { createVestingAminoConverters } from "@cosmjs/stargate/build/modules";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { AuthInfo, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import invariant from "tiny-invariant";

import { LegacyMultisigSigner } from "./multisig-signer";
import { OfflineAminoSigner } from "./offline-amino-signer";
import { LegacyCosmosChainId, legacyCosmosChains } from "../../chains";
import { CosmJsClient } from "../../clients";
import { MultisigPublicKey, PublicKey, Secp256k1KeyPair } from "../../keys";
import { Secp256k1PrivateKeySigner } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractTransactionsSdk } from "../abstract";
import { AccountValidationResult, BroadcastTransactionResult } from "../common";

export class LegacyCosmosTransactionsSdk extends AbstractTransactionsSdk {
  protected chainId: LegacyCosmosChainId;
  protected client: CosmJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: LegacyCosmosChainId;
    client: CosmJsClient;
  }) {
    super(chainId);
    this.chainId = chainId;
    this.client = client;
  }

  public getAddressOfPublicKey(publicKey: PublicKey) {
    return pubkeyToAddress(publicKey, this.chain.prefix);
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
    address: string
  ): Promise<AccountValidationResult> {
    if (!this.validateAddress(address)) {
      return AccountValidationResult.INVALID_ADDRESS;
    }
    const account = await this.fetchAccount(address);
    if (!account) {
      return AccountValidationResult.ACCOUNT_NOT_READY;
    }
    if (!account.pubkey) {
      return AccountValidationResult.PUBLIC_KEY_NOT_READY;
    }
    return AccountValidationResult.READY;
  }

  protected async prepareKeyPairQueryFn(keyPair: Secp256k1KeyPair) {
    const address = this.getAddressOfPublicKey(keyPair.publicKey);
    await this.prepareAccount(address);
    const validationResult = await this.validateAccount(address);
    invariant(
      validationResult >= AccountValidationResult.PUBLIC_KEY_NOT_READY,
      "Account not ready"
    );
    if (validationResult <= AccountValidationResult.PUBLIC_KEY_NOT_READY) {
      await this.client.withSigningStargateClient(
        OfflineAminoSigner.fromSigner({
          signer: new Secp256k1PrivateKeySigner(keyPair.privateKey),
          prefix: this.chain.prefix,
        }),
        async (client) => {
          await client.sendTokens(
            address,
            address,
            coins(1, this.chain.denom),
            "auto",
            ""
          );
        }
      );
      while (
        (await this.validateAccount(address)) <=
        AccountValidationResult.PUBLIC_KEY_NOT_READY
      ) {
        await this.wait({ ms: 100 });
      }
    }
  }

  protected async fetchAccount(address: string) {
    return this.client.withStargateClient(async (client) => {
      return await client.getAccount(address);
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

    const aminoMessages = messages.map((message) => {
      return message.toAmino();
    });
    const encodeObjects = aminoMessages.map((aminoMessage) => {
      return this.aminoTypes.fromAmino(aminoMessage);
    });

    return new LegacyMultisigSigner({
      chainId: this.chainId,
      account,
      fee: this.defaultFee,
      encodeObjects,
      messages: aminoMessages,
      multisigPublicKey,
    });
  }

  public async broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }): Promise<BroadcastTransactionResult> {
    return await this.client.withStargateClient(async (client) => {
      const rawResult = await client.broadcastTx(signedTransaction);
      return {
        success: isDeliverTxSuccess(rawResult),
        transactionHash: rawResult.transactionHash,
        rawLog: rawResult.rawLog,
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
    const transaction = TxRaw.decode(signedTransaction);
    const { fee } = AuthInfo.decode(transaction.authInfoBytes);

    const hasEnoughForFees = async () => {
      if (!fee) return true;
      invariant(fee.amount.length === 1, "fee.amount.length must be 1");
      const balance = await this.fetchBalance({
        address: sender,
        denom: fee.amount[0].denom,
      });
      return (
        balance &&
        parseInt(balance.amount, 10) >= parseInt(fee.amount[0].amount, 10)
      );
    };

    while (!(await hasEnoughForFees())) {
      await this.lendFees(sender);
    }

    return await this.broadcastSignedTransaction({ signedTransaction });
  }

  protected async fetchBalance({
    address,
    denom,
  }: {
    address: string;
    denom: string;
  }) {
    return this.client.withStargateClient(async (client) => {
      return await client.getBalance(address, denom);
    });
  }

  protected get defaultFee(): StdFee {
    return {
      amount: coins(6000, this.chain.denom),
      gas: "1280000",
    };
  }

  protected get aminoTypes() {
    return new AminoTypes({
      ...createAuthzAminoConverters(),
      ...createBankAminoConverters(),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
      ...createStakingAminoConverters(),
      ...createIbcAminoConverters(),
      ...createFeegrantAminoConverters(),
      ...createVestingAminoConverters(),
      ...createWasmAminoConverters(),
    });
  }

  protected get chain() {
    return legacyCosmosChains[this.chainId];
  }
}
