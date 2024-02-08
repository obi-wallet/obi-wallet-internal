import { CosmosSdkTargetChain } from "@/target-chain/cosmos-sdk";
import {
  CosmosSdkChainId,
  isCosmosSdkChainId,
} from "@/target-chain/cosmos-sdk/chains";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";

export type TargetChainId = CosmosSdkChainId;

export class TargetChain {
  public constructor(protected chainId: TargetChainId) {}

  public static chainId(chainId: string): AbstractTargetChain {
    if (isCosmosSdkChainId(chainId)) {
      return new CosmosSdkTargetChain(chainId);
    }
    throw new Error(`ChainId ${chainId} not found`);
  }
}
