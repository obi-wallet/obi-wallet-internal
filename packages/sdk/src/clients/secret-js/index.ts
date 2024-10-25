import { createWasmAminoConverters } from "@cosmjs/cosmwasm-stargate";
import {
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
} from "@cosmjs/stargate";
import { serialize } from "@obi-wallet/sdk-json";
import { BroadcastMode, Msg, SecretNetworkClient, TxResponse } from "secretjs";
import { StdFee } from "secretjs/dist/wallet_amino";
import invariant from "tiny-invariant";
import { z } from "zod";

import { SecretJsHomeChainId, SecretJsHomeChains } from "../../home-chains";
import { BroadcastTransactionResult } from "../../sdk";
import {
  AminoSignerWithAddress,
  SecretJsAminoSigner,
} from "../../sdk/common/secret-js/amino-signer";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";

export async function withSecretNetworkClient<T>(
  chainId: SecretJsHomeChainId,
  f: (client: SecretNetworkClient) => Promise<T>,
) {
  const chain = SecretJsHomeChains[chainId];

  let lastError = null;
  for (const url of chain.urls) {
    try {
      const client = new SecretNetworkClient({
        url,
        chainId,
      });
      return await f(client);
    } catch (e) {
      lastError = e;
      console.error(e);
    }
  }
  throw lastError;
}

export async function withSigningSecretNetworkClient<T>(
  {
    chainId,
    signer,
  }: {
    chainId: SecretJsHomeChainId;
    signer: AminoSignerWithAddress;
  },
  f: (client: SecretNetworkClient) => Promise<T>,
) {
  const chain = SecretJsHomeChains[chainId];

  let lastError = null;
  for (const url of chain.urls) {
    try {
      const client = new SecretNetworkClient({
        url,
        chainId,
        wallet: signer,
        walletAddress: signer.address,
      });
      return await f(client);
    } catch (e) {
      lastError = e;
      console.error(e);
    }
  }
  throw lastError;
}

export class SecretJsClient {
  public constructor(protected chainId: SecretJsHomeChainId) {}

  public withSecretNetworkClient<T>(
    f: (client: SecretNetworkClient) => Promise<T>,
  ) {
    return withSecretNetworkClient(this.chainId, f);
  }

  public withSigningSecretNetworkClient<T>(
    signer: AminoSignerWithAddress,
    f: (client: SecretNetworkClient) => Promise<T>,
  ) {
    return withSigningSecretNetworkClient({ chainId: this.chainId, signer }, f);
  }

  public async queryContract<T extends z.ZodTypeAny>({
    contract,
    codeHash,
    query,
    schema,
  }: {
    contract: string;
    codeHash: string;
    query: object;
    schema: T;
  }): Promise<z.infer<T>> {
    const [response] = await this.queryContracts([
      { contract, codeHash, query, schema },
    ]);
    return response;
  }

  public async queryContracts<T extends z.ZodTypeAny>(
    queries: {
      contract: string;
      codeHash: string;
      query: object;
      schema: T;
    }[],
  ): Promise<z.infer<T>[]> {
    return await this.withSecretNetworkClient(async (client) => {
      return await Promise.all(
        queries.map(async ({ contract, codeHash, query, schema }) => {
          const response = await client.query.compute.queryContract({
            contract_address: contract,
            code_hash: codeHash,
            query,
          });
          try {
            return schema.parse(response);
          } catch (e) {
            console.log(response);
            throw e;
          }
        }),
      );
    });
  }

  public async createAndSignTransaction({
    signer,
    messages,
    gasLimit,
  }: {
    signer: Signer;
    messages: Message[];
    gasLimit?: number;
  }): Promise<SignedTransaction> {
    return await this.withSigningSecretNetworkClient(
      SecretJsAminoSigner.fromSigner({ signer, prefix: this.chain.prefix }),
      async (client) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return await client.tx.signTx(messages as Msg[], {
          ...this.defaultTxOptions,
          gasLimit: gasLimit ?? this.defaultTxOptions.gasLimit,
        });
      },
    );
  }

  public async broadcastSignedTransactionOrMockTxDuringTest({
    signedTransaction,
    hash,
  }: {
    signedTransaction: SignedTransaction;
    hash: string;
  }): Promise<BroadcastTransactionResult> {
    if (process.env.NODE_ENV === "test") {
      const rawResult = await this.withSecretNetworkClient(async (client) => {
        return await client.query.getTx(hash);
      });
      invariant(rawResult, "no tx response");
      return this.wrapTxResponse(rawResult);
    }

    return await this.broadcastSignedTransaction(signedTransaction);
  }

  public async broadcastSignedTransaction(
    signedTransaction: SignedTransaction,
  ): Promise<BroadcastTransactionResult> {
    return await this.withSecretNetworkClient(async (client) => {
      // TODO: need to do Sync/Async here
      const broadcastMode = BroadcastMode.Block;
      const txResponse = await client.tx.broadcastSignedTx(signedTransaction, {
        ...this.defaultTxOptions,
        broadcastMode: broadcastMode,
        waitForCommit: true,
      });
      if (broadcastMode !== BroadcastMode.Block) {
        await new Promise((resolve) => {
          setTimeout(resolve, 10_000);
        });
      }
      console.warn("Broadcast response: ", serialize(txResponse));
      let rawResult;
      if (broadcastMode !== BroadcastMode.Block || !txResponse.rawLog) {
        rawResult = await client.query.getTx(txResponse.transactionHash);

        if (!rawResult) {
          // tx might be in mempool, so try block
          try {
            const res = await client.tx.broadcastSignedTx(signedTransaction, {
              ...this.defaultTxOptions,
              broadcastMode: BroadcastMode.Block,
              waitForCommit: false,
            });
            if (!res.code) {
              throw new Error("no res code");
            }
            return {
              success: true,
              transactionHash: res.transactionHash,
              rawLog: res.rawLog,
              rawResult: res,
            };
          } catch {
            await new Promise((resolve) => {
              setTimeout(resolve, 5_000);
            });
            rawResult = await client.query.getTx(txResponse.transactionHash);
          }
        }
      }
      // TODO retry handling instead
      rawResult = txResponse;
      invariant(rawResult, "no tx response");
      return this.wrapTxResponse(rawResult);
    });
  }

  protected wrapTxResponse(rawResult: TxResponse): BroadcastTransactionResult {
    return {
      success: rawResult.code === 0,
      transactionHash: rawResult.transactionHash,
      rawLog: rawResult.rawLog,
      rawResult,
    };
  }

  public get aminoTypes() {
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
    return SecretJsHomeChains[this.chainId];
  }

  public get defaultFee(): StdFee {
    return {
      amount: [
        {
          amount: "20000",
          denom: "uscrt",
        },
      ],
      gas: "2560000",
    };
  }

  public get defaultTxOptions() {
    return {
      gasLimit: 800_000,
      gasPriceInFeeDenom: 0.05,
      feeDenom: this.chain.denom,
      broadcastMode: BroadcastMode.Block,
    };
  }
}
