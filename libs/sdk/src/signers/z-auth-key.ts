import { Signer } from "./abstract";
import { KeySubclassTypeMapping, KeyType } from "../data-structures";
import { Secp256k1PublicKey } from "../keys";

export class ZAuthKeySigner extends Signer {
  public constructor(protected key: KeySubclassTypeMapping[KeyType.ZAuth]) {
    super();
  }

  public get publicKey(): Secp256k1PublicKey {
    return this.key.publicKey;
  }

  public async signHash(hash: Uint8Array) {
    const response = await fetch("/api/zauth/sign", {
      method: "POST",
      body: JSON.stringify({
        hash: Buffer.from(hash).toString("base64"),
      }),
    });
    const { signedHash } = await response.json();
    return new Uint8Array(Buffer.from(signedHash, "base64"));
  }
}
