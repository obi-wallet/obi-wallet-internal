import * as t from "io-ts";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedDeviceKeyPayload = t.type({
  publicKey: Secp256k1PublicKey,
});

export type SerializedDeviceKeyPayload = t.TypeOf<
  typeof SerializedDeviceKeyPayload
>;
