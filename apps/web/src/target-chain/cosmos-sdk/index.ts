import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { pubkeyToAddress } from "secretjs";

export abstract class AbstractCosmosSdkTargetChain extends AbstractTargetChain {
  protected constructor(protected prefix: string) {
    super();
  }

  public computeAddress(publicKey: Secp256k1PublicKey) {
    return pubkeyToAddress(
      getSec256k1CompressedPublicKey(publicKey),
      this.prefix,
    );
  }
}
