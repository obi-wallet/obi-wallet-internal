import { SHA256, Word32Array } from "jscrypto";

import { KeySubclassTypeMapping, KeyType } from "../data-structures";
import { Secp256k1PublicKey } from "../keys";

export abstract class Signer {
  public abstract get publicKey(): Secp256k1PublicKey;
  public abstract signHash(hash: Uint8Array): Promise<Uint8Array>;

  public async sign(payload: Buffer): Promise<Buffer> {
    console.log("calling signer sign()");
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

export interface PendingSignature {
  hash: Uint8Array;
  resolve: (signature: Uint8Array) => void;
  reject: () => void;
}

export class AsyncKeySigner<T extends KeyType> extends Signer {
  protected pendingSignature: PendingSignature | null = null;
  protected pendingSignaturePromise:
    | ((signature: PendingSignature) => void)
    | null = null;

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
      if (this.pendingSignaturePromise) {
        this.pendingSignaturePromise(this.pendingSignature);
        this.pendingSignaturePromise = null;
      }
    });
  }

  public async waitForPendingSignature(): Promise<PendingSignature> {
    if (this.pendingSignature) {
      return this.pendingSignature;
    }

    return await new Promise<PendingSignature>((resolve) => {
      this.pendingSignaturePromise = resolve;
    });
  }

  protected async finishSignature(signature: Uint8Array) {
    const { resolve } = await this.waitForPendingSignature();
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
