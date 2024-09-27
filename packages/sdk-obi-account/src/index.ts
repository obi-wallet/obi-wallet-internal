import { Ed25519PublicKey } from "@obi-wallet/sdk-ed25519";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

export interface ObiAccountPublicKeys {
  secp256k1: Secp256k1PublicKey;
  ed25519: Ed25519PublicKey;
}
