import { SHA256, Word32Array } from "jscrypto";

import { KeySubclassTypeMapping, KeyType } from "../data-structures";
import { Secp256k1PublicKey } from "../keys";

export abstract class Signer {
  public abstract get publicKey(): Secp256k1PublicKey;
  public abstract signHash(hash: Uint8Array): Promise<Uint8Array>;

  public async sign(payload: Buffer): Promise<Buffer> {
    return Buffer.from(await this.signHash(this.createHash(payload)));
  }

  protected createHash(payload: Buffer): Uint8Array {
    const hash = Buffer.from(
      SHA256.hash(new Word32Array(payload)).toString(),
      "hex",
    );
    return Uint8Array.from(hash);
  }
}

export class AsyncKeySigner<T extends KeyType> extends Signer {
  protected pendingSignature: {
    hash: Uint8Array;
    resolve: (signature: Uint8Array) => void;
    reject: () => void;
  } | null = null;

  public constructor(protected key: KeySubclassTypeMapping[T]) {
    super();
  }

  public get publicKey() {
    return this.key.publicKey;
  }

  public async signHash(hash: Uint8Array) {
    return new Promise<Uint8Array>((resolve, reject) => {
      this.pendingSignature = {
        hash,
        resolve,
        reject,
      };
    });
  }

  protected finishSignature(signature: Uint8Array) {
    if (!this.pendingSignature) {
      throw new Error("No pending signature found.");
    }
    const { resolve } = this.pendingSignature;
    resolve(signature);
    this.pendingSignature = null;
  }

  public cancelSignature() {
    if (!this.pendingSignature) return;
    const { reject } = this.pendingSignature;
    reject();
    this.pendingSignature = null;
  }
}
