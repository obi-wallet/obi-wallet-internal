import * as t from "io-ts";

import { migratable } from "../../helpers";
import { SerializedMultisigKey } from "../multisig-key/keys";

export const MigratableSerializedProxyAddress = migratable(
  t.type({
    address: t.string,
    codeId: t.number,
  })
);

export type SerializedProxyAddress = t.TypeOf<
  typeof MigratableSerializedProxyAddress.currentVersion
>;

export const Chain = t.union([
  t.literal("uni-3"),
  t.literal("juno-1"),
  t.literal("pisco-1"),
  t.literal("phoenix-1"),
]);

export const MigratableSerializedMultisigWalletData = migratable(
  t.type({
    chain: Chain,
    owner: SerializedMultisigKey,
    proxyAddress: MigratableSerializedProxyAddress.anyVersion,
  })
).addMigration({
  nextVersion: t.type({
    chain: Chain,
    owner: SerializedMultisigKey,
    proxyAddress: MigratableSerializedProxyAddress.currentVersion,
  }),
  migrate(data) {
    return {
      ...data,
      proxyAddress: MigratableSerializedProxyAddress.migrate(data.proxyAddress),
    };
  },
});

export type SerializedMultisigWalletData = t.TypeOf<
  typeof MigratableSerializedMultisigWalletData.currentVersion
>;

export const MigratableSerializedMultisigWallet = migratable(
  t.type({
    type: t.literal("multisig"),
    data: MigratableSerializedMultisigWalletData.anyVersion,
  })
).addMigration({
  nextVersion: t.type({
    type: t.literal("multisig"),
    data: MigratableSerializedMultisigWalletData.currentVersion,
  }),
  migrate(data) {
    return {
      ...data,
      data: MigratableSerializedMultisigWalletData.migrate(data.data),
    };
  },
});

export type SerializedMultisigWallet = t.TypeOf<
  typeof MigratableSerializedMultisigWallet.currentVersion
>;

export const MigratableSerializedMultisigDemoWallet = migratable(
  t.type({
    type: t.literal("multisig-demo"),
    data: MigratableSerializedMultisigWalletData.anyVersion,
  })
).addMigration({
  nextVersion: t.type({
    type: t.literal("multisig-demo"),
    data: MigratableSerializedMultisigWalletData.currentVersion,
  }),
  migrate(data) {
    return {
      ...data,
      data: MigratableSerializedMultisigWalletData.migrate(data.data),
    };
  },
});

export type SerializedMultisigDemoWallet = t.TypeOf<
  typeof MigratableSerializedMultisigDemoWallet.currentVersion
>;
