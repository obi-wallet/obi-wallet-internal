import {
  BroadcastMode,
  fromBase64,
  Msg,
  SecretNetworkClient,
  toBase64,
  TxOptions,
} from "secretjs";
import { z } from "zod";

import { SecretJsChainId, secretJsChains } from "../../chains";
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
  const chain = secretJsChains[chainId];
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
  const chain = secretJsChains[chainId];
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
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction> {
    return await this.withSigningSecretNetworkClient(
      SecretJsAminoSigner.fromSigner({ signer, prefix: this.chain.prefix }),
      async (client) => {
        return fromBase64(
          await client.tx.signTx(messages as Msg[], this.defaultTxOptions),
        );
      },
    );
  }

  public async broadcastSignedTransaction(
    signedTransaction: SignedTransaction,
  ): Promise<BroadcastTransactionResult> {
    return await this.withSecretNetworkClient(async (client) => {
      const rawResult = await client.tx.broadcastSignedTx(
        toBase64(signedTransaction),
        this.defaultTxOptions,
      );
      return {
        success: rawResult.code === 0,
        transactionHash: rawResult.transactionHash,
        rawLog: rawResult.rawLog,
        rawResult,
      };
    });
  }

  protected get chain() {
    return secretJsChains[this.chainId];
  }

  public get defaultTxOptions(): TxOptions {
    return {
      gasLimit: 1_000_000,
      gasPriceInFeeDenom: 0.1,
      feeDenom: this.chain.denom,
      broadcastMode: BroadcastMode.Block,
    };
  }
}
