import * as t from "io-ts";

import * as CosmosMultisig from "./cosmos-multisig-wallet/serialized-data";
import * as Multisig from "./multisig-wallet/serialized-data";
import * as TerraMultisig from "./terra-multisig-wallet/serialized-data";
import { nullable } from "../helpers";

export const SerializedMultisigWalletAnyVersion = t.type({
  type: t.literal("multisig"),
  data: Multisig.SerializedDataAnyVersion,
});

export const SerializedMultisigWallet = t.type({
  type: t.literal("multisig"),
  data: Multisig.SerializedData,
});
export type SerializedMultisigWallet = t.TypeOf<
  typeof SerializedMultisigWallet
>;

export const SerializedMultisigDemoWalletAnyVersion = t.type({
  type: t.literal("multisig-demo"),
  data: Multisig.SerializedDataAnyVersion,
});

export const SerializedMultisigDemoWallet = t.type({
  type: t.literal("multisig-demo"),
  data: Multisig.SerializedData,
});
export type SerializedMultisigDemoWallet = t.TypeOf<
  typeof SerializedMultisigDemoWallet
>;

export const SerializedTerraMultisigWalletAnyVersion = t.type({
  type: t.literal("terra-multisig"),
  data: TerraMultisig.SerializedDataAnyVersion,
});

export const SerializedTerraMultisigWallet = t.type({
  type: t.literal("terra-multisig"),
  data: TerraMultisig.SerializedData,
});
export type SerializedTerraMultisigWallet = t.TypeOf<
  typeof SerializedTerraMultisigWallet
>;

export const SerializedTerraMultisigDemoWalletAnyVersion = t.type({
  type: t.literal("terra-multisig-demo"),
  data: TerraMultisig.SerializedDataAnyVersion,
});

export const SerializedTerraMultisigDemoWallet = t.type({
  type: t.literal("terra-multisig-demo"),
  data: TerraMultisig.SerializedData,
});
export type SerializedTerraMultisigDemoWallet = t.TypeOf<
  typeof SerializedTerraMultisigDemoWallet
>;

export const SerializedCosmosMultisigWalletTypeV0 = t.literal("multisig");
export const SerializedCosmosMultisigWalletType = t.literal("cosmos-multisig");
export const SerializedCosmosMultisigWalletTypeAnyVersion = t.union([
  SerializedCosmosMultisigWalletTypeV0,
  SerializedCosmosMultisigWalletType,
]);

export const SerializedCosmosMultisigWalletAnyVersion = t.type({
  type: SerializedCosmosMultisigWalletTypeAnyVersion,
  data: CosmosMultisig.SerializedDataAnyVersion,
});

export const SerializedCosmosMultisigWallet = t.type({
  type: SerializedCosmosMultisigWalletType,
  data: CosmosMultisig.SerializedData,
});
export type SerializedCosmosMultisigWallet = t.TypeOf<
  typeof SerializedCosmosMultisigWallet
>;

export const SerializedCosmosDemoMultisigWalletTypeV0 =
  t.literal("multisig-demo");
export const SerializedCosmosDemoMultisigWalletType = t.literal(
  "cosmos-multisig-demo"
);
export const SerializedCosmosDemoMultisigWalletTypeAnyVersion = t.union([
  SerializedCosmosDemoMultisigWalletTypeV0,
  SerializedCosmosDemoMultisigWalletType,
]);

export const SerializedCosmosMultisigDemoWalletAnyVersion = t.type({
  type: SerializedCosmosDemoMultisigWalletTypeAnyVersion,
  data: CosmosMultisig.SerializedDataAnyVersion,
});

export const SerializedCosmosMultisigDemoWallet = t.type({
  type: SerializedCosmosDemoMultisigWalletType,
  data: CosmosMultisig.SerializedData,
});
export type SerializedCosmosMultisigDemoWallet = t.TypeOf<
  typeof SerializedCosmosMultisigDemoWallet
>;

export const SerializedCosmosSinglesigWalletTypeV0 = t.literal("singlesig");
export const SerializedCosmosSinglesigWalletType =
  t.literal("cosmos-singlesig");
export const SerializedCosmosSinglesigWalletTypeAnyVersion = t.union([
  SerializedCosmosSinglesigWalletTypeV0,
  SerializedCosmosSinglesigWalletType,
]);

export const SerializedCosmosSinglesigWalletAnyVersion = t.type({
  type: SerializedCosmosSinglesigWalletTypeAnyVersion,
  data: t.string,
});
export const SerializedCosmosSinglesigWallet = t.type({
  type: SerializedCosmosSinglesigWalletType,
  data: t.string,
});
export type SerializedCosmosSinglesigWallet = t.TypeOf<
  typeof SerializedCosmosSinglesigWallet
>;

export const SerializedWalletAnyVersion = t.union([
  SerializedTerraMultisigWalletAnyVersion,
  SerializedTerraMultisigDemoWalletAnyVersion,
  SerializedCosmosMultisigWalletAnyVersion,
  SerializedCosmosMultisigDemoWalletAnyVersion,
  SerializedCosmosSinglesigWalletAnyVersion,
  SerializedMultisigWalletAnyVersion,
  SerializedMultisigDemoWalletAnyVersion,
]);
export type SerializedWalletAnyVersion = t.TypeOf<
  typeof SerializedWalletAnyVersion
>;
export const SerializedWallet = t.union([
  SerializedMultisigWallet,
  SerializedMultisigDemoWallet,
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
    const wallets: SerializedWallet[] = [];

    serializedData.wallets.forEach((wallet) => {
      if (
        SerializedTerraMultisigWalletAnyVersion.is(wallet) ||
        SerializedTerraMultisigDemoWalletAnyVersion.is(wallet)
      ) {
        const isDemo = SerializedTerraMultisigDemoWalletAnyVersion.is(wallet);
        const data = TerraMultisig.migrateSerializedData(wallet.data);
        if (data) {
          wallets.push({
            type: isDemo ? "multisig-demo" : "multisig",
            data,
          });
        }
      } else if (
        SerializedCosmosMultisigWalletAnyVersion.is(wallet) ||
        SerializedCosmosMultisigDemoWalletAnyVersion.is(wallet)
      ) {
        const isDemo = SerializedCosmosMultisigDemoWalletAnyVersion.is(wallet);
        const data = CosmosMultisig.migrateSerializedData(wallet.data);
        if (data) {
          wallets.push({
            type: isDemo ? "multisig-demo" : "multisig",
            data,
          });
        }
      } else if (
        SerializedMultisigWallet.is(wallet) ||
        SerializedMultisigDemoWallet.is(wallet)
      ) {
        wallets.push(wallet);
      }
    });

    return {
      ...serializedData,
      wallets,
    };
  }

  return serializedData;
}
