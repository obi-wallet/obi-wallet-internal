import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";

import { CosmosChain, cosmosChains } from "../chains";

export async function withCosmosClients<T>(
  chainId: CosmosChain,
  f: (clients: {
    stargateClient: StargateClient;
    cosmWasmClient: CosmWasmClient;
  }) => T
) {
  const [stargateClient, cosmWasmClient] = await Promise.all([
    createStargateClient(chainId),
    createCosmWasmClient(chainId),
  ]);
  try {
    return await f({ stargateClient, cosmWasmClient });
  } finally {
    stargateClient.disconnect();
    cosmWasmClient.disconnect();
  }
}

export async function withCosmosStargateClient<T>(
  chainId: CosmosChain,
  f: (client: StargateClient) => T
) {
  const client = await createStargateClient(chainId);
  try {
    return await f(client);
  } finally {
    client.disconnect();
  }
}

export async function withCosmosCosmWasmClient<T>(
  chainId: CosmosChain,
  f: (client: CosmWasmClient) => T
) {
  const client = await createCosmWasmClient(chainId);
  try {
    return await f(client);
  } finally {
    client.disconnect();
  }
}

async function createStargateClient(chainId: CosmosChain) {
  const { rpcs } = cosmosChains[chainId];
  for (const rpc of rpcs) {
    try {
      return await StargateClient.connect(rpc);
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}

async function createCosmWasmClient(chainId: CosmosChain) {
  const { rpcs } = cosmosChains[chainId];
  for (const rpc of rpcs) {
    try {
      return await CosmWasmClient.connect(rpc);
    } catch (e) {
      console.error(e);
    }
  }
  throw new Error("No RPC connected");
}
