import { AbstractCosmosSdkTargetChain } from "@/target-chain/cosmos-sdk";

export class SeiTargetChain extends AbstractCosmosSdkTargetChain {
  public constructor() {
    super("sei");
  }

  public get label() {
    return "Sei";
  }
}
