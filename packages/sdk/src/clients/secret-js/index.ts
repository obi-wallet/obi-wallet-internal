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
import { Effect, Schedule } from "effect";
import { BroadcastMode, Msg, SecretNetworkClient, TxResponse } from "secretjs";
import { StdFee } from "secretjs/dist/wallet_amino";
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
      return await this.fetchTx(hash);
    }

    return await this.broadcastSignedTransaction(signedTransaction);
  }

  public async broadcastSignedTransaction(
    signedTransaction: SignedTransaction,
  ) {
    const { transactionHash } = await this.withSecretNetworkClient(
      async (client) => {
        return await client.tx.broadcastSignedTx(
          signedTransaction,
          this.defaultTxOptions,
        );
      },
    );
    return await this.fetchTx(transactionHash);
  }

  public async fetchTx(transactionHash: string) {
    const fetchTxTask = Effect.tryPromise(async () => {
      let lastError = null;

      for (const url of this.chain.urls) {
        try {
          const client = new SecretNetworkClient({
            url,
            chainId: this.chainId,
          });
          const response = await client.query.getTx(transactionHash);
          if (response) {
            return response;
          }
        } catch (e) {
          lastError = e;
          console.error(e);
        }
      }

      if (lastError) {
        throw lastError;
      }

      throw new Error("TX Not found");
    });
    const schedule = Schedule.addDelay(Schedule.recurUpTo("10 seconds"), () => {
      return "1 second";
    });
    const txResponse = await Effect.runPromise(
      Effect.retry(fetchTxTask, schedule),
    );
    return this.wrapTxResponse(txResponse);
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
      gasPriceInFeeDenom: 0.1,
      feeDenom: this.chain.denom,
      broadcastMode: BroadcastMode.Sync,
      waitForCommit: false,
    };
  }
}
