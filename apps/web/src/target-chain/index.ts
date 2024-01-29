import { AbstractTargetChain } from "@/target-chain/abstract";
import { SeiTargetChain } from "@/target-chain/sei";

export enum TargetChainId {
  Sei = 'pacific-1"',
}

export class TargetChain {
  public constructor(protected chainId: TargetChainId) {}

  public static chainId(chainId: string): AbstractTargetChain {
    switch (chainId) {
      case TargetChainId.Sei:
        return new SeiTargetChain();
      default:
        throw new Error(`Unknown chainId: ${chainId}`);
    }
  }
}
