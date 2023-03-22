import { z } from "zod";

import { ArrayIndex } from "../array-index";
import { GatekeeperConfig } from "../gatekeeper-config";
import { migratable } from "../migratable";
import { MultisigKey } from "../multisig-key";
import { SinglesigWallet } from "../singlesig-wallet";

export const ProxyAddress = migratable(
  z.object({
    address: z.string(),
    codeId: z.number().int().positive(),
  })
).addMigration({
  nextSchema: z.object({
    v: z.literal(1),
    address: z.string(),
  }),
  migrate(data) {
    return {
      v: 1 as const,
      address: data.address,
    };
  },
});

const Chain = z.union([
  z.literal("uni-3"),
  z.literal("juno-1"),
  z.literal("pisco-1"),
  z.literal("phoenix-1"),
]);

const MultisigWalletData = migratable(
  z.object({
    chain: Chain,
    owner: MultisigKey.schema.migratableSchema,
    proxyAddress: ProxyAddress.migratableSchema,
    gatekeeperConfig: GatekeeperConfig.schema.migratableSchema,
    singlesigWallets: z.array(SinglesigWallet.schema.migratableSchema),
    currentAccount: z
      .object({
        type: z.union([
          z.literal("flex-account"),
          z.literal("singlesig-wallet"),
        ]),
        index: ArrayIndex,
      })
      .nullable(),
  })
).addMigration({
  nextSchema: z.object({
    chain: Chain,
    owner: MultisigKey.schema.migratableSchema,
    proxyAddress: ProxyAddress.migratableSchema,
    gatekeeperConfig: GatekeeperConfig.schema.migratableSchema,
    singlesigWallets: z.array(SinglesigWallet.schema.migratableSchema),
    currentAccount: z
      .object({
        type: z.union([
          z.literal("flex-account"),
          z.literal("singlesig-wallet"),
        ]),
        id: z.string(),
      })
      .nullable(),
  }),
  migrate(data) {
    return {
      ...data,
      currentAccount: null,
    };
  },
});

export const MultisigWalletSchema = migratable(
  z.object({
    type: z.union([z.literal("multisig"), z.literal("multisig-demo")]),
    data: MultisigWalletData.migratableSchema,
  })
);
