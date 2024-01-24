import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { pubkeyToAddress } from "secretjs";

export enum TargetChainId {
  Sei = 'pacific-1"',
}

export abstract class AbstractTargetChain {
  public abstract get label(): string;
  public abstract computeAddress(publicKey: Secp256k1PublicKey): string;
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

export class SeiTargetChain extends AbstractTargetChain {
  public get label() {
    return "Sei";
  }

  public computeAddress(publicKey: Secp256k1PublicKey) {
    return pubkeyToAddress(Buffer.from(publicKey.value, "base64"), "sei");
  }
}
