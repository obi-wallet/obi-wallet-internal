import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math/build/decimal";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { z } from "zod";

import { Chain, CosmosChainId, LegacyCosmosChainId } from "../../chains";
import { AbstractClient } from "../abstract";

export async function withCosmJsClients<T>(
  chainId: CosmosChainId | LegacyCosmosChainId,
  f: (clients: {
    stargateClient: StargateClient;
    cosmWasmClient: CosmWasmClient;
  }) => T
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
  f: (client: StargateClient) => T
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
  f: (client: SigningStargateClient) => T
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
  f: (client: CosmWasmClient) => T
) {
  const client = await createCosmJsCosmWasmClient(chainId);
  try {
    return await f(client);
  } finally {
    client.disconnect();
  }
}

async function createCosmJsStargateClient(
  chainId: CosmosChainId | LegacyCosmosChainId
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
  chainId: CosmosChainId | LegacyCosmosChainId
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

  public withCosmWasmClient<T>(f: (client: CosmWasmClient) => T) {
    return withCosmJsCosmWasmClient(this.chainId, f);
  }

  public withStargateClient<T>(f: (client: StargateClient) => T) {
    return withCosmJsStargateClient(this.chainId, f);
  }

  public withSigningStargateClient<T>(
    signer: OfflineSigner,
    f: (client: SigningStargateClient) => T
  ) {
    return withCosmJsSigningStargateClient(
      { chainId: this.chainId, signer },
      f
    );
  }

  public withClients<T>(
    f: (clients: {
      stargateClient: StargateClient;
      cosmWasmClient: CosmWasmClient;
    }) => T
  ) {
    return withCosmJsClients(this.chainId, f);
  }

  public async queryContract<T extends z.ZodTypeAny>({
    contract,
    query,
    schema,
  }: {
    contract: string;
    query: unknown;
    schema: T;
  }): Promise<z.infer<T>> {
    return await this.withCosmWasmClient(async (client) => {
      const response = await client.queryContractSmart(contract, query);
      return schema.parse(response);
    });
  }
}
