import invariant from "tiny-invariant";

import { Signer } from "./abstract";
import { Secp256k1PrivateKeySigner } from "./sec256k1-private-key";
import { KeySubclassTypeMapping, KeyType } from "../data-structures";
import { Secp256k1PublicKey } from "../keys";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export class ZAuthKeySigner extends Signer {
  protected readonly mockSigner: Secp256k1PrivateKeySigner;

  public constructor(protected key: KeySubclassTypeMapping[KeyType.ZAuth]) {
    super();
    invariant(
      key.publicKey.value === DEMO_PUBLIC_KEY,
      "ZAuthSigner only supports the demo public key for now",
    );
    this.mockSigner = new Secp256k1PrivateKeySigner(DEMO_PRIVATE_KEY);
  }

  public get publicKey(): Secp256k1PublicKey {
    return this.mockSigner.publicKey;
  }

  public async signHash(hash: Uint8Array) {
    return this.mockSigner.signHash(hash);
  }
}
