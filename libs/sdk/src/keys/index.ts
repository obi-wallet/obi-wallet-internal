import { MultisigPublicKey } from "./multisig";
import { Secp256k1PublicKey } from "./sec256k1";

export * from "./legacy";
export * from "./multisig";
export * from "./sec256k1";
export * from "./webauthn";
export * from "./encryption-service";

export type PublicKey = Secp256k1PublicKey | MultisigPublicKey;
