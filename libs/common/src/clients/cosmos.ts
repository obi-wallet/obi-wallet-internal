import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { CosmosChain, cosmosChains } from "@obi-wallet/sdk";

export async function createStargateClient(chainId: CosmosChain) {
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

export async function createCosmWasmClient(chainId: CosmosChain) {
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
