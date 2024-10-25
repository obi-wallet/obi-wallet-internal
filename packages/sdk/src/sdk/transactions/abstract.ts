import { HomeChainId } from "../../home-chains";
import { PublicKey } from "../../keys";

export abstract class AbstractTransactionsSdk {
  protected constructor(protected chainId: HomeChainId) {}

  /**
   * Address of the given public key.
   */
  public abstract getAddressOfPublicKey(publicKey: PublicKey): string;
}
