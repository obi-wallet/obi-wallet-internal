import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { SHA256, Word32Array } from "jscrypto";

export function createHash(payload: Uint8Array): Uint8Array {
  return SHA256.hash(new Word32Array(payload)).toUint8Array();
}

export abstract class Signer {
  public abstract get publicKey(): Secp256k1PublicKey;
  public abstract signHash(hash: Uint8Array): Promise<Uint8Array>;

  public async sign(payload: Buffer): Promise<Buffer> {
    return Buffer.from(await this.signHash(this.createHash(payload)));
  }

  protected createHash(payload: Buffer): Uint8Array {
    return createHash(payload);
  }
}
