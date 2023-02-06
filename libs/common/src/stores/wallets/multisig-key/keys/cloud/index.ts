import * as t from "io-ts";

import { Secp256k1PublicKey } from "../public-key";

export const SerializedCloudKeyProvider = t.literal("google-drive");

export const SerializedCloudKeyPayload = t.type({
  publicKey: Secp256k1PublicKey,
  privateKey: t.string,
});

export type SerializedCloudKeyPayload = t.TypeOf<
  typeof SerializedCloudKeyPayload
>;
