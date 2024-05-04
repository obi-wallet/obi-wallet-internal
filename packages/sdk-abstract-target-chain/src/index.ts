import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

export interface Asset {
  name: string;
  symbol: string;
  decimals: number;
  image: string | null;
}

export abstract class AbstractTargetChain {
  public abstract get label(): string;
  public abstract get image(): string;
  public abstract get disabled(): boolean;

  public abstract computeAddress(publicKey: Secp256k1PublicKey): string;
  public abstract validateAddress(address: string): boolean;

  public abstract getAsset(denom: string): Asset | null;
}
