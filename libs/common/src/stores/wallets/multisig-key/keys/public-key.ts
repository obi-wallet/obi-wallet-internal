import * as t from "io-ts";

export const Secp256k1PublicKey = t.type({
  type: t.literal("tendermint/PubKeySecp256k1"),
  value: t.string,
});
export type Secp256k1PublicKey = t.TypeOf<typeof Secp256k1PublicKey>;
