import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import * as secp256k1 from "secp256k1";
import invariant from "tiny-invariant";

import { Signer } from "./abstract";
import { KeySubclassTypeMapping, KeyType } from "../data-structures";

export class UnitySigner extends Signer {
  private privateKey: string;

  public constructor(protected key: KeySubclassTypeMapping[KeyType.Unity]) {
    super();
    invariant(
      key.payload.privateKey,
      "private key is required for unity signer type",
    );
    this.privateKey = key.payload.privateKey;
  }

  public get publicKey(): Secp256k1PublicKey {
    return this.key.publicKey;
  }

  public async signHash(hash: Uint8Array) {
    console.log("unity signing hash: " + Buffer.from(hash).toString("base64"));
    return secp256k1.ecdsaSign(hash, Buffer.from(this.privateKey, "base64"))
      .signature;
  }
}
