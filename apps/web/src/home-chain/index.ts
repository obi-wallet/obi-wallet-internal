import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { HomeChainId } from "@obi-wallet/sdk";

export class HomeChain {
  public constructor(protected chainId: HomeChainId) {}

  public static chainId(chainId: HomeChainId): SecretJsHomeChain {
    return new SecretJsHomeChain(chainId);
  }
}
