import * as t from "io-ts";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedEmailKeyPayload = t.type({
  publicKey: Secp256k1PublicKey,
});

export type SerializedEmailKeyPayload = t.TypeOf<
  typeof SerializedEmailKeyPayload
>;
