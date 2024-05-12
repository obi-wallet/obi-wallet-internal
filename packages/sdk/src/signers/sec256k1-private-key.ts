import { Encoding } from "@obi-wallet/encoding";
import {
  Sec256k1PrivateKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import * as secp256k1 from "secp256k1";

import { Signer } from "./abstract";

export class Secp256k1PrivateKeySigner extends Signer {
  protected readonly privateKey: Uint8Array;

  public constructor(privateKey: Sec256k1PrivateKey) {
    super();
    this.privateKey = new Uint8Array(Buffer.from(privateKey, "base64"));
  }

  public get publicKey(): Secp256k1PublicKey {
    const publicKey = secp256k1.publicKeyCreate(this.privateKey);
    return {
      type: "tendermint/PubKeySecp256k1",
      value: Encoding.fromBytes(publicKey).toBase64(),
    };
  }

  public async signHash(hash: Uint8Array) {
    return secp256k1.ecdsaSign(hash, this.privateKey).signature;
  }
}
