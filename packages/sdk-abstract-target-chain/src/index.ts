import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

export abstract class AbstractTargetChain {
  public abstract get label(): string;
  public abstract computeAddress(publicKey: Secp256k1PublicKey): string;
}
