import invariant from "tiny-invariant";

import { Signer } from "./abstract";
import { MultisigPublicKey, Secp256k1PublicKey } from "../keys";
import { SignedTransaction } from "../transactions";

export abstract class MultisigSigner<T = unknown> {
  protected signatures: Map<string, T> = new Map();

  protected constructor(protected publicKey: MultisigPublicKey) {}

  protected abstract createSignature(signer: Signer): Promise<T>;
  protected abstract unsafeCreateSignedTransactionOrMessage(): {
    signed: Array<Uint8Array>;
    broadcast: boolean;
  };

  public createSignedTransactionOrMessage(): {
    signed: Array<Uint8Array>,
    broadcast: boolean
  } {
    invariant(
      this.enoughSignatures,
      "Not enough signatures to create signed transaction",
    );
    return this.unsafeCreateSignedTransactionOrMessage();
  }

  public async addSigner(signer: Signer) {
    this.signatures.set(
      signer.publicKey.value,
      await this.createSignature(signer),
    );
  }

  public alreadySigned(publicKey: Secp256k1PublicKey) {
    return this.signatures.has(publicKey.value);
  }

  public get numberOfSignatures() {
    return this.signatures.size;
  }

  public get threshold() {
    return parseInt(this.publicKey.value.threshold, 10);
  }

  public get enoughSignatures() {
    return this.numberOfSignatures >= this.threshold;
  }

  public get orderedSignatures() {
    return this.publicKey.value.pubkeys
      .map((publicKey) => {
        return this.signatures.get(publicKey.value);
      })
      .filter((signature): signature is T => {
        return signature !== undefined;
      });
  }
}
