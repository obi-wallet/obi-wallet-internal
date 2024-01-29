import { SeiTargetChain } from "@/target-chain/sei";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";

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
