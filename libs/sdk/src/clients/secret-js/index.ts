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
import {
  BroadcastMode,
  fromBase64,
  Msg,
  SecretNetworkClient,
  toBase64,
  TxOptions,
} from "secretjs";
import { StdFee } from "secretjs/dist/wallet_amino";
import invariant from "tiny-invariant";
import { z } from "zod";

import { SecretJsChainId, SecretJsChains } from "../../chains";
import { BroadcastTransactionResult } from "../../sdk";
import {
  AminoSignerWithAddress,
  SecretJsAminoSigner,
} from "../../sdk/common/secret-js/amino-signer";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractClient } from "../abstract";

export async function withSecretNetworkClient<T>(
  chainId: SecretJsChainId,
  f: (client: SecretNetworkClient) => T,
) {
  const chain = SecretJsChains[chainId];
  const client = new SecretNetworkClient({
    url: chain.urls[0],
    chainId,
  });
  return await f(client);
}

export async function withSigningSecretNetworkClient<T>(
  {
    chainId,
    signer,
  }: {
    chainId: SecretJsChainId;
    signer: AminoSignerWithAddress;
  },
  f: (client: SecretNetworkClient) => T,
) {
  const chain = SecretJsChains[chainId];
  const client = new SecretNetworkClient({
    url: chain.urls[0],
    chainId,
    wallet: signer,
    walletAddress: signer.address,
  });
  return await f(client);
}

export class SecretJsClient extends AbstractClient {
  public constructor(protected chainId: SecretJsChainId) {
    super();
  }

  public withSecretNetworkClient<T>(f: (client: SecretNetworkClient) => T) {
    return withSecretNetworkClient(this.chainId, f);
  }

  public withSigningSecretNetworkClient<T>(
    signer: AminoSignerWithAddress,
    f: (client: SecretNetworkClient) => T,
  ) {
    return withSigningSecretNetworkClient({ chainId: this.chainId, signer }, f);
  }

  public async queryContracts<T extends z.ZodTypeAny>(
    queries: {
      contract: string;
      query: object;
      schema: T;
    }[],
  ): Promise<z.infer<T>[]> {
    return this.withSecretNetworkClient(async (client) => {
      return await Promise.all(
        queries.map(async ({ contract, query, schema }) => {
          const response = await client.query.compute.queryContract({
            contract_address: contract,
            query,
          });
          return schema.parse(response);
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
        return fromBase64(
          await client.tx.signTx(messages as Msg[], {
            ...this.defaultTxOptions,
            gasLimit: gasLimit ?? this.defaultTxOptions.gasLimit,
          }),
        );
      },
    );
  }

  public async broadcastSignedTransaction(
    signedTransaction: SignedTransaction,
  ): Promise<BroadcastTransactionResult> {
    return await this.withSecretNetworkClient(async (client) => {
      // TODO: need to do Sync/Async here
      const broadcastMode = BroadcastMode.Block;
      const txResponse = await client.tx.broadcastSignedTx(
        toBase64(signedTransaction),
        {
          ...this.defaultTxOptions,
          broadcastMode: broadcastMode,
          waitForCommit: true,
        },
      );
      if (broadcastMode !== BroadcastMode.Block) {
        await new Promise((resolve) => {
          setTimeout(resolve, 10_000);
        });
      }
      console.warn("Broadcast response: " + JSON.stringify(txResponse));
      let rawResult;
      if (broadcastMode !== BroadcastMode.Block || !txResponse.rawLog) {
        rawResult = await client.query.getTx(txResponse.transactionHash);

        if (!rawResult) {
          // tx might be in mempool, so try block
          try {
            const res = await client.tx.broadcastSignedTx(
              toBase64(signedTransaction),
              {
                ...this.defaultTxOptions,
                broadcastMode: BroadcastMode.Block,
                waitForCommit: false,
              },
            );
            if (!res.code) {
              throw new Error("no res code");
            }
            return {
              success: true,
              transactionHash: res.transactionHash,
              rawLog: res.rawLog,
              rawResult: res,
            };
          } catch (e) {
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
      return {
        success: rawResult.code === 0,
        transactionHash: rawResult.transactionHash,
        rawLog: rawResult.rawLog,
        rawResult,
      };
    });
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
    return SecretJsChains[this.chainId];
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

  public get defaultTxOptions(): TxOptions {
    return {
      gasLimit: 400_000,
      gasPriceInFeeDenom: 0.05,
      feeDenom: this.chain.denom,
      broadcastMode: BroadcastMode.Block,
    };
  }
}
