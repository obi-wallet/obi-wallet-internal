import * as t from "io-ts";

import { SerializedMultisigKey } from "../multisig-key/keys";

export const SerializedProxyAddress = t.type({
  address: t.string,
  codeId: t.number,
});
export type SerializedProxyAddress = t.TypeOf<typeof SerializedProxyAddress>;

export const SerializedProxyAddressAnyVersion = t.union([
  SerializedProxyAddress,
  SerializedProxyAddress,
]);

export type SerializedProxyAddressAnyVersion = t.TypeOf<
  typeof SerializedProxyAddressAnyVersion
>;

export function migrateSerializedProxyAddress(
  serializedProxyAddress: SerializedProxyAddressAnyVersion | null
): SerializedProxyAddress | null {
  return serializedProxyAddress;
}

export const Chain = t.union([
  t.literal("uni-3"),
  t.literal("juno-1"),
  t.literal("pisco-1"),
  t.literal("phoenix-1"),
]);

export const SerializedData = t.type({
  chain: Chain,
  owner: SerializedMultisigKey,
  proxyAddress: SerializedProxyAddress,
});
export type SerializedData = t.TypeOf<typeof SerializedData>;

export const SerializedDataAnyVersion = t.union([
  SerializedData,
  SerializedData,
]);
export type SerializedDataAnyVersion = t.TypeOf<
  typeof SerializedDataAnyVersion
>;

export function migrateSerializedData(
  serializedData: SerializedDataAnyVersion
): SerializedData {
  return serializedData;
}
