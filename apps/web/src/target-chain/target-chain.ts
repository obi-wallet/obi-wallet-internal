import { AbstractCosmosSdkTargetChain } from "@/target-chain/cosmos-sdk";
import { ChainData, TargetChainId, TargetChains } from "./chains";

export class TargetChainData extends AbstractCosmosSdkTargetChain {
  private chainData: ChainData;
  public constructor(chain: string) {
    super(TargetChains[chain as TargetChainId].prefix);
    this.chainData = TargetChains[chain as TargetChainId];
    console.log(this.chainData);
  }

  public get label() {
    return this.chainData.name;
  }
  get data() {
    return this.chainData;
  }
}
