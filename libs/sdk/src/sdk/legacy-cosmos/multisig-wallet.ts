import { StdFee } from "@cosmjs/amino";
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
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import warning from "tiny-warning";

import { LegacyCosmosChainId, legacyCosmosChains } from "../../chains";
import { CosmJsClient } from "../../clients";
import {
  FlexAccount,
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractMultisigWalletSdk } from "../abstract";
import { BroadcastTransactionResult, CodeIds, Token } from "../common";
import { CosmJsOfflineAminoSigner } from "../common/cosm-js";
import { Messages } from "../messages";
import { Sdk } from "../sdk";

function notImplemented(message: string) {
  warning(false, message);
}

export class LegacyCosmosMultisigWalletSdk extends AbstractMultisigWalletSdk {
  protected chainId: LegacyCosmosChainId;
  protected client: CosmJsClient;

  public constructor({
    chainId,
    wallet,
  }: {
    chainId: LegacyCosmosChainId;
    wallet: MultisigWallet;
  }) {
    super({ chainId, wallet });
    this.chainId = chainId;
    this.client = new CosmJsClient(chainId);
  }
  protected async codeIdsQueryFn(): Promise<CodeIds> {
    return {
      userAccount: await this.sdk.contracts.codeId(this.wallet.proxyAddress),
      spendLimitGatekeeper: null,
      debtGatekeeper: null,
    };
  }

  protected async isOutdatedQueryFn(): Promise<boolean> {
    const codeIds = await this.codeIds();
    return codeIds.userAccount < this.chain.currentCodeId;
  }

  public async updateWallet(): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateWallet not implemented for Cosmos");
    return { approved: false };
  }

  public async updateOwner(_: MultisigKey): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateOwner not implemented for Cosmos");
    return { approved: false };
  }

  public async updateGatekeeperConfig(_: GatekeeperConfig): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateGatekeeperConfig not implemented for Cosmos");
    return { approved: false };
  }

  public async stake(_: {
    amount: Token;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("stake not implemented for Cosmos");
    return { approved: false };
  }

  public async unstake(_: {
    amount: Token;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("unstake not implemented for Cosmos");
    return { approved: false };
  }

  public async withdrawRewards(): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("withdrawRewards not implemented for Cosmos");
    return { approved: false };
  }

  public async canExecute(_: {
    flexAccount: FlexAccount;
    messages: Message[];
  }): Promise<boolean> {
    notImplemented("canExecute not implemented for Cosmos");
    return false;
  }

  public async createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction> {
    return await this.client.withSigningStargateClient(
      CosmJsOfflineAminoSigner.fromSigner({
        signer,
        prefix: this.chain.prefix,
      }),
      async (client) => {
        const encodeObjects = messages.map((message) => {
          return this.aminoTypes.fromAmino(message.toAmino());
        });
        const gas = await client.simulate(
          this.sdk.transactions.getAddressOfPublicKey(signer.publicKey),
          encodeObjects,
          ""
        );
        const transaction = await client.sign(
          this.sdk.transactions.getAddressOfPublicKey(signer.publicKey),
          encodeObjects,
          {
            ...this.defaultFee,
            gas: gas.toString(),
          },
          ""
        );
        return TxRaw.encode(transaction).finish();
      }
    );
  }

  public async broadcastSignedTransaction(
    signedTransaction: SignedTransaction
  ): Promise<BroadcastTransactionResult> {
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

  protected get messages() {
    return Messages.chainId(this.chainId);
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }
}
