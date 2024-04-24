import { ChainId } from "../../chains";
import { PublicKey } from "../../keys";

export abstract class AbstractTransactionsSdk {
  protected constructor(protected chainId: ChainId) {}

  /**
   * Address of the given public key.
   */
  public abstract getAddressOfPublicKey(publicKey: PublicKey): string;
}
