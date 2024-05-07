import { CosmosSdkTargetChain } from "@/target-chain/cosmos-sdk";
import {
  allCosmosSdkChainIds,
  CosmosSdkChainId,
  isCosmosSdkChainId,
} from "@/target-chain/cosmos-sdk/chains";
import { EvmTargetChain } from "@/target-chain/evm";
import {
  allEvmChainIds,
  EvmChainId,
  isEvmChainId,
} from "@/target-chain/evm/chains";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";

export type TargetChainId = CosmosSdkChainId | EvmChainId;

export const allTargetChainIds = [...allCosmosSdkChainIds, ...allEvmChainIds];

export class TargetChain {
  protected constructor(protected chainId: TargetChainId) {}

  public static chainId(chainId: CosmosSdkChainId): CosmosSdkTargetChain;
  public static chainId(chainId: EvmChainId): EvmTargetChain;
  public static chainId(chainId: string): AbstractTargetChain;
  public static chainId(chainId: string): AbstractTargetChain {
    if (isCosmosSdkChainId(chainId)) {
      return new CosmosSdkTargetChain(chainId);
    }
    if (isEvmChainId(chainId)) {
      return new EvmTargetChain(chainId);
    }
    throw new Error(`ChainId ${chainId} not found`);
  }
}
