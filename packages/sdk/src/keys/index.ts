import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

import { MultisigPublicKey } from "./multisig";

export * from "./multisig";
export * from "./webauthn";

export type PublicKey = Secp256k1PublicKey | MultisigPublicKey;
