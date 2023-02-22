import { z } from "zod";

import { migratable } from "../../helpers";
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
);

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
