import { Key as TerraKey, SimplePublicKey } from "@terra-money/feather.js";

import { AbstractSigner } from "../../signers";

export class Key extends TerraKey {
  protected constructor(protected signer: AbstractSigner) {
    super(SimplePublicKey.fromAmino(signer.publicKey));
  }

  public async sign(payload: Buffer) {
    return this.signer.sign(payload);
  }

  public static fromSigner(signer: AbstractSigner) {
    return new Key(signer);
  }
}
