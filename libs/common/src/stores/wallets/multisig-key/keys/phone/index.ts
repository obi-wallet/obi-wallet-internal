import * as t from "io-ts";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedPhoneKeyPayload = t.type({
  publicKey: Secp256k1PublicKey,
  phoneNumber: t.string,
  securityQuestion: t.string,
});
