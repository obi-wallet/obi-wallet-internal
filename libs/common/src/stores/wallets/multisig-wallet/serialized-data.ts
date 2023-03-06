import { z } from "zod";

import { migratable } from "../../helpers";
import { GatekeeperConfig } from "../gatekeeper-config";
import { SerializedGatekeeperConfig } from "../gatekeeper-config/serialized-data";
import { SerializedMultisigKey } from "../multisig-key/keys";
import { Secp256k1PublicKey } from "../multisig-key/keys/public-key";

export const MigratableSerializedProxyAddress = migratable(
  z.object({
    address: z.string(),
    codeId: z.number().int().positive(),
  })
);

export type SerializedProxyAddress = z.infer<
  typeof MigratableSerializedProxyAddress.schema
>;

export const Chain = z.union([
  z.literal("uni-3"),
  z.literal("juno-1"),
  z.literal("pisco-1"),
  z.literal("phoenix-1"),
]);

export const SinglesigWallet = z.object({
  type: z.literal("singlesig-wallet"),
  publicKey: Secp256k1PublicKey,
  privateKey: z.string(),
});

export type SinglesigWallet = z.infer<typeof SinglesigWallet>;

export const MigratableSerializedMultisigWalletData = migratable(
  z.object({
    chain: Chain,
    owner: SerializedMultisigKey,
    proxyAddress: MigratableSerializedProxyAddress.schema,
  })
).addMigration({
  nextSchema: z.object({
    chain: Chain,
    owner: SerializedMultisigKey,
    proxyAddress: MigratableSerializedProxyAddress.schema,
    gatekeeperConfig: SerializedGatekeeperConfig,
    singlesigWallets: z.array(SinglesigWallet),
  }),
  migrate(data) {
    const gatekeeperConfig = new GatekeeperConfig();
    return {
      ...data,
      gatekeeperConfig: gatekeeperConfig.serialize(),
      singlesigWallets: [],
    };
  },
});

export type SerializedMultisigWalletData = z.infer<
  typeof MigratableSerializedMultisigWalletData.schema
>;

export const MigratableSerializedMultisigWallet = migratable(
  z.object({
    type: z.literal("multisig"),
    data: MigratableSerializedMultisigWalletData.schema,
  })
);

export type SerializedMultisigWallet = z.infer<
  typeof MigratableSerializedMultisigWallet.schema
>;

export const MigratableSerializedMultisigDemoWallet = migratable(
  z.object({
    type: z.literal("multisig-demo"),
    data: MigratableSerializedMultisigWalletData.schema,
  })
);

export type SerializedMultisigDemoWallet = z.infer<
  typeof MigratableSerializedMultisigDemoWallet.schema
>;
