import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";

import { Signer } from "./abstract";
import { MultisigPublicKey } from "../keys";

export abstract class MultisigSigner<T = unknown> {
  protected signatures: Map<string, T> = new Map();

  protected constructor(protected publicKey: MultisigPublicKey) {}

  protected abstract createSignature(signer: Signer): Promise<T>;
  protected abstract unsafeCreateSignedTransactionOrMessage(): {
    signed: Array<Uint8Array>;
    broadcast: boolean;
  };

  public createSignedTransactionOrMessage(): {
    signed: Array<Uint8Array>;
    broadcast: boolean;
  } {
    invariant(
      this.enoughSignatures,
      "Not enough signatures to create signed transaction",
    );
    return this.unsafeCreateSignedTransactionOrMessage();
  }

  public async addSigner(signer: Signer) {
    console.log("adding signer with pubkey: " + signer.publicKey.value);
    this.signatures.set(
      signer.publicKey.value,
      await this.createSignature(signer),
    );
    console.log("signatures set!: " + JSON.stringify(this.signatures));
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
