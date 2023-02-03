import * as t from "io-ts";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedNfcKeyPayload = t.type({
  publicKey: Secp256k1PublicKey,
  localEntropy: t.string,
});

export type SerializedNfcKeyPayload = t.TypeOf<typeof SerializedNfcKeyPayload>;
