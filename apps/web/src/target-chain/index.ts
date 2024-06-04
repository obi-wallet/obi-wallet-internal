import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";

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

export type TargetChainId = CosmosChainId | Eip155ChainId;

export const allTargetChainIds = [...allCosmosChains, ...allEip155Chains];

export class TargetChain {
  protected constructor(protected chainId: TargetChainId) {}

  public static chainId(chainId: CosmosChainId): CosmosTargetChain;
  public static chainId(chainId: Eip155ChainId): Eip155TargetChain;
  public static chainId(
    chainId: TargetChainId,
  ): AbstractTargetChain<TargetChainId>;
  public static chainId(chainId: string): AbstractTargetChain;
  public static chainId(chainId: string): AbstractTargetChain {
    if (isCosmosChainId(chainId)) {
      return new CosmosTargetChain(chainId);
    }
    if (isEip155ChainId(chainId)) {
      return new Eip155TargetChain(chainId);
    }
    throw new Error(`ChainId ${chainId} not found`);
  }
}
