import { MultisigPublicKey } from "./multisig";
import { Secp256k1PublicKey } from "./sec256k1";

export * from "./multisig";
export * from "./sec256k1";

export type PublicKey = Secp256k1PublicKey | MultisigPublicKey;
