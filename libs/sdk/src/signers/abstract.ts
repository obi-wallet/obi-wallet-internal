import { SHA256, Word32Array } from "jscrypto";

import { PublicKey } from "../keys";

export abstract class AbstractSigner {
  public abstract get publicKey(): PublicKey;
  public abstract signHash(hash: Uint8Array): Promise<Uint8Array>;

  public async sign(payload: Buffer): Promise<Buffer> {
    return Buffer.from(await this.signHash(this.createHash(payload)));
  }

  protected createHash(payload: Buffer): Uint8Array {
    const hash = Buffer.from(
      SHA256.hash(new Word32Array(payload)).toString(),
      "hex"
    );
    return Uint8Array.from(hash);
  }
}
