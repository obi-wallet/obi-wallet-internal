import * as t from "io-ts";

import { nullable } from "../helpers";
import * as Multisig from "../multisig/serialized-data";

export const SerializedTerraMultisigWalletAnyVersion = t.type({
  type: t.literal("terra-multisig"),
  data: Multisig.SerializedDataAnyVersion,
});

export const SerializedTerraMultisigWallet = t.type({
  type: t.literal("terra-multisig"),
  data: Multisig.SerializedData,
});
export type SerializedTerraMultisigWallet = t.TypeOf<
  typeof SerializedTerraMultisigWallet
>;

// export const SerializedMultisigDemoWalletAnyVersion = t.type({
//   type: t.literal("multisig-demo"),
//   data: Multisig.SerializedDataAnyVersion,
// });

// export const SerializedMultisigDemoWallet = t.type({
//   type: t.literal("multisig-demo"),
//   data: Multisig.SerializedData,
// });
// export type SerializedMultisigDemoWallet = t.TypeOf<
//   typeof SerializedMultisigDemoWallet
// >;

// export const SerializedSinglesigWalletAnyVersion = t.type({
//   type: t.literal("singlesig"),
//   data: t.string,
// });
// export const SerializedSinglesigWallet = SerializedSinglesigWalletAnyVersion;
// export type SerializedSinglesigWallet = t.TypeOf<
//   typeof SerializedSinglesigWallet
// >;

export const SerializedWalletAnyVersion = t.union([
  SerializedTerraMultisigWalletAnyVersion,
  SerializedTerraMultisigWalletAnyVersion,
  // SerializedMultisigDemoWalletAnyVersion,
  // SerializedSinglesigWalletAnyVersion,
]);
export type SerializedWalletAnyVersion = t.TypeOf<
  typeof SerializedWalletAnyVersion
>;
export const SerializedWallet = t.union([
  SerializedTerraMultisigWallet,
  SerializedTerraMultisigWallet,
  // SerializedMultisigDemoWallet,
  // SerializedSinglesigWallet,
]);
export type SerializedWallet = t.TypeOf<typeof SerializedWallet>;

export const SerializedDataV0 = t.type({
  currentWalletIndex: nullable(t.number),
  wallets: t.array(SerializedWalletAnyVersion),
});

export const SerializedData = t.type({
  currentWalletIndex: nullable(t.number),
  wallets: t.array(SerializedWallet),
});
export type SerializedData = t.TypeOf<typeof SerializedData>;

export const SerializedDataAnyVersion = SerializedDataV0;
export type SerializedDataAnyVersion = t.TypeOf<
  typeof SerializedDataAnyVersion
>;

export function migrateSerializedData(
  serializedData: SerializedDataAnyVersion
): SerializedData {
  if (SerializedDataV0.is(serializedData)) {
    return {
      ...serializedData,
      wallets: serializedData.wallets.map((wallet) => {
        if (
          SerializedTerraMultisigWalletAnyVersion.is(wallet)
          // || SerializedMultisigDemoWalletAnyVersion.is(wallet)
        ) {
          return {
            type: wallet.type,
            data: Multisig.migrateSerializedData(wallet.data),
          };
        }
        return wallet;
      }),
    };
  }

  return serializedData;
}
