import * as t from "io-ts";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedSocialKeyPayload = t.type({
  publicKey: Secp256k1PublicKey,
});

export type SerializedSocialKeyPayload = t.TypeOf<
  typeof SerializedSocialKeyPayload
>;
