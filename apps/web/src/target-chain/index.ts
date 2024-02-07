import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";

import { TargetChains } from ".";
import { TargetChainId } from ".";
import { TargetChainData } from "./target-chain";

export class TargetChain {
  public constructor(protected chainId: TargetChainId) {}

  public static chainId(chainId: string): AbstractTargetChain {
    if (TargetChains[chainId as TargetChainId] === undefined) {
      throw new Error(`ChainId ${chainId} not found`);
    }
    return new TargetChainData(chainId);
  }
}
export * from "./target-chain";
export * from "./chains";
