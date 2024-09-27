import { SecretTargetChain } from "@/target-chain/secret";
import {
  allSecretChains,
  isSecretChainId,
  SecretChainId,
} from "@/target-chain/secret/chains";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import { Key } from "@obi-wallet/wallet-connect";

import { CosmosTargetChain } from "./cosmos";
import {
  allCosmosChains,
  CosmosChainId,
  isCosmosChainId,
} from "./cosmos/chains";
import { Eip155TargetChain } from "./eip-155";
import {
  allEip155Chains,
  Eip155ChainId,
  isEip155ChainId,
} from "./eip-155/chains";
import { SolanaTargetChain } from "./solana";
import {
  allSolanaChains,
  isSolanaChainId,
  SolanaChainId,
} from "./solana/chains";

export type TargetChainId =
  | CosmosChainId
  | Eip155ChainId
  | SecretChainId
  | SolanaChainId;

export function isTargetChainId(chainId: string): chainId is TargetChainId {
  return (
    isCosmosChainId(chainId) ||
    isEip155ChainId(chainId) ||
    isSecretChainId(chainId) ||
    isSolanaChainId(chainId)
  );
}

export const allTargetChainIds = [
  ...allCosmosChains,
  ...allEip155Chains,
  ...allSecretChains,
  ...allSolanaChains,
];

export class TargetChain {
  protected constructor(protected chainId: TargetChainId) {}

  public static chainId(chainId: CosmosChainId): CosmosTargetChain;
  public static chainId(chainId: Eip155ChainId): Eip155TargetChain;
  public static chainId(chainId: SecretChainId): SecretTargetChain;
  public static chainId(chainId: SolanaChainId): SolanaTargetChain;
  public static chainId(
    chainId: TargetChainId,
  ): AbstractTargetChain<TargetChainId>;
  public static chainId(chainId: string): AbstractTargetChain;

  public static chainId(
    chainId: string,
  ):
    | CosmosTargetChain
    | Eip155TargetChain
    | SecretTargetChain
    | SolanaTargetChain
    | AbstractTargetChain<TargetChainId>
    | AbstractTargetChain {
    if (isCosmosChainId(chainId)) {
      return new CosmosTargetChain(chainId);
    }
    if (isEip155ChainId(chainId)) {
      return new Eip155TargetChain(chainId);
    }
    if (isSecretChainId(chainId)) {
      return new SecretTargetChain(chainId);
    }
    if (isSolanaChainId(chainId)) {
      return new SolanaTargetChain(chainId);
    }
    throw new Error(`ChainId ${chainId} not found`);
  }

  public static async getSupportedWalletConnectNamespaces() {
    const namespaces = await Promise.all([
      CosmosTargetChain.getSupportedWalletConnectNamespaces(),
      Eip155TargetChain.getSupportedWalletConnectNamespaces(),
    ]);

    return {
      ...namespaces[0],
      ...namespaces[1],
    };
  }

  public static async getWalletConnectKeys(): Promise<Key[]> {
    const keys = await Promise.all([
      CosmosTargetChain.getWalletConnectKeys(),
      Eip155TargetChain.getWalletConnectKeys(),
    ]);

    return keys.flat();
  }
}
