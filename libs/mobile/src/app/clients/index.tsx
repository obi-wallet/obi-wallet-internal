import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math/build/decimal";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { CosmosChain, cosmosChains } from "@obi-wallet/common";

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

export async function createSigningStargateClient({
  chainId,
  signer,
}: {
  chainId: CosmosChain;
  signer: OfflineSigner;
}) {
  const { denom, prefix, rpcs } = cosmosChains[chainId];
  for (const rpc of rpcs) {
    try {
      return await SigningStargateClient.connectWithSigner(rpc, signer, {
        prefix,
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

export async function createSigningCosmWasmClient({
  chainId,
  signer,
}: {
  chainId: CosmosChain;
  signer: OfflineSigner;
}) {
  const { denom, prefix, rpcs } = cosmosChains[chainId];
  for (const rpc of rpcs) {
    try {
      return await SigningCosmWasmClient.connectWithSigner(rpc, signer, {
        prefix,
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
