import { StdFee } from "@cosmjs/amino";
import {
  CosmWasmClient,
  createWasmAminoConverters,
} from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math/build/decimal";
import { coins, OfflineSigner } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  DistributionExtension,
  isDeliverTxSuccess,
  QueryClient,
  setupDistributionExtension,
  setupStakingExtension,
  SigningStargateClient,
  StakingExtension,
  StargateClient,
} from "@cosmjs/stargate";
import { createVestingAminoConverters } from "@cosmjs/stargate/build/modules";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { PageResponse } from "cosmjs-types/cosmos/base/query/v1beta1/pagination";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { z } from "zod";

import { Chain, CosmosChainId, LegacyCosmosChainId } from "../../chains";
import { BroadcastTransactionResult, Messages, Sdk } from "../../sdk";
import { CosmJsOfflineAminoSigner } from "../../sdk/common/cosm-js";
import { CosmosSdkMessages } from "../../sdk/messages/cosmos-sdk";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractClient } from "../abstract";

export async function withCosmJsClients<T>(
  chainId: CosmosChainId | LegacyCosmosChainId,
  f: (clients: {
    stargateClient: StargateClient;
    cosmWasmClient: CosmWasmClient;
  }) => T,
) {
  const [stargateClient, cosmWasmClient] = await Promise.all([
    createCosmJsStargateClient(chainId),
    createCosmJsCosmWasmClient(chainId),
  ]);
  try {
    return await f({ stargateClient, cosmWasmClient });
  } finally {
    stargateClient.disconnect();
    cosmWasmClient.disconnect();
  }
}

export async function withCosmJsStargateClient<T>(
  chainId: CosmosChainId | LegacyCosmosChainId,
  f: (client: StargateClient) => T,
) {
  const client = await createCosmJsStargateClient(chainId);
  try {
    return await f(client);
  } finally {
    client.disconnect();
  }
}

export async function withCosmJsSigningStargateClient<T>(
  {
    chainId,
    signer,
  }: { chainId: CosmosChainId | LegacyCosmosChainId; signer: OfflineSigner },
  f: (client: SigningStargateClient) => T,
) {
  const client = await createCosmJsSigningStargateClient({ chainId, signer });
  try {
    return await f(client);
  } finally {
    client.disconnect();
  }
}

export async function withCosmJsCosmWasmClient<T>(
  chainId: CosmosChainId | LegacyCosmosChainId,
  f: (client: CosmWasmClient) => T,
) {
  const client = await createCosmJsCosmWasmClient(chainId);
  try {
    return await f(client);
  } finally {
    client.disconnect();
  }
}

export async function withCosmJsTendermint34Client<T>(
  chainId: CosmosChainId | LegacyCosmosChainId,
  f: (client: Tendermint34Client) => T,
) {
  const client = await createCosmJsTendermint34Client(chainId);
  try {
    return await f(client);
  } finally {
    client.disconnect();
  }
}

async function createCosmJsStargateClient(
  chainId: CosmosChainId | LegacyCosmosChainId,
) {
  const { rpcs } = cosmosChainInformation(chainId);
  for (const rpc of rpcs) {
    try {
      return await StargateClient.connect(rpc);
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}

export async function createCosmJsSigningStargateClient({
  chainId,
  signer,
}: {
  chainId: CosmosChainId | LegacyCosmosChainId;
  signer: OfflineSigner;
}) {
  const { denom, rpcs } = cosmosChainInformation(chainId);
  for (const rpc of rpcs) {
    try {
      return await SigningStargateClient.connectWithSigner(rpc, signer, {
        gasPrice: {
          // low: 10, average: 25, high: 40
          amount: Decimal.fromAtomics("25", 4),
          denom,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}

async function createCosmJsCosmWasmClient(
  chainId: CosmosChainId | LegacyCosmosChainId,
) {
  const { rpcs } = cosmosChainInformation(chainId);
  for (const rpc of rpcs) {
    try {
      return await CosmWasmClient.connect(rpc);
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}

async function createCosmJsTendermint34Client(
  chainId: CosmosChainId | LegacyCosmosChainId,
) {
  const { rpcs } = cosmosChainInformation(chainId);
  for (const rpc of rpcs) {
    try {
      return await Tendermint34Client.connect(rpc);
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}

function cosmosChainInformation(chainId: CosmosChainId | LegacyCosmosChainId) {
  return Chain.select<{ denom: string; rpcs: string[] }>({
    chainId,
    onCosmosChain(chain) {
      return chain;
    },
    onLegacyCosmosChain(chain) {
      return chain;
    },
    onTerraChain() {
      throw new Error("Not a Cosmos chain");
    },
  });
}

export class CosmJsClient extends AbstractClient {
  public constructor(protected chainId: CosmosChainId | LegacyCosmosChainId) {
    super();
  }

  public async fetchAllPages<T>(
    f: (paginationKey?: Uint8Array) => Promise<[T[], PageResponse | undefined]>,
  ): Promise<T[]> {
    const result: T[] = [];
    let key: Uint8Array | undefined = undefined;

    do {
      const [list, pagination] = await f(key);
      result.push(...list);
      key = pagination?.nextKey;
    } while (key?.length);

    return result;
  }

  public withCosmWasmClient<T>(f: (client: CosmWasmClient) => T) {
    return withCosmJsCosmWasmClient(this.chainId, f);
  }

  public withStargateClient<T>(f: (client: StargateClient) => T) {
    return withCosmJsStargateClient(this.chainId, f);
  }

  public async withStakingExtensions<T>(
    f: (extensions: DistributionExtension & StakingExtension) => T,
  ) {
    return await withCosmJsTendermint34Client(this.chainId, async (client) => {
      return f(
        QueryClient.withExtensions(
          client,
          setupDistributionExtension,
          setupStakingExtension,
        ),
      );
    });
  }

  public withSigningStargateClient<T>(
    signer: OfflineSigner,
    f: (client: SigningStargateClient) => T,
  ) {
    return withCosmJsSigningStargateClient(
      { chainId: this.chainId, signer },
      f,
    );
  }

  public withClients<T>(
    f: (clients: {
      stargateClient: StargateClient;
      cosmWasmClient: CosmWasmClient;
    }) => T,
  ) {
    return withCosmJsClients(this.chainId, f);
  }

  public async queryContracts<T extends z.ZodTypeAny>(
    queries: {
      contract: string;
      query: unknown;
      schema: T;
    }[],
  ): Promise<z.infer<T>[]> {
    return await this.withCosmWasmClient(async (client) => {
      return await Promise.all(
        queries.map(async ({ contract, query, schema }) => {
          const response = await client.queryContractSmart(contract, query);
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
    return await this.withSigningStargateClient(
      CosmJsOfflineAminoSigner.fromSigner({
        signer,
        prefix: this.chain.prefix,
      }),
      async (client) => {
        const encodeObjects = messages.map((message) => {
          return this.aminoTypes.fromAmino(this.messages.toJSON(message));
        });
        const gas = await client.simulate(
          this.sdk.transactions.getAddressOfPublicKey(signer.publicKey),
          encodeObjects,
          "",
        );
        const transaction = await client.sign(
          this.sdk.transactions.getAddressOfPublicKey(signer.publicKey),
          encodeObjects,
          {
            ...this.defaultFee,
            gas: gas.toString(),
          },
          "",
        );
        return TxRaw.encode(transaction).finish();
      },
    );
  }

  public async broadcastSignedTransaction(
    signedTransaction: SignedTransaction,
  ): Promise<BroadcastTransactionResult> {
    return await this.withStargateClient(async (client) => {
      const rawResult = await client.broadcastTx(signedTransaction);
      return {
        success: isDeliverTxSuccess(rawResult),
        transactionHash: rawResult.transactionHash,
        rawLog: rawResult.rawLog,
        rawResult,
      };
    });
  }

  public get defaultFee(): StdFee {
    return {
      amount: coins(12000, this.chain.denom),
      gas: "2560000",
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
    return Chain.information(this.chainId);
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }

  protected get messages() {
    return Messages.chainId(this.chainId) as CosmosSdkMessages;
  }
}
