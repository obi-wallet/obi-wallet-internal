import { z } from "zod";

import { ArrayIndex } from "../array-index";
import { ChainIdSchema } from "../chain-id";
import { GatekeeperConfig } from "../gatekeeper-config";
import { migratable } from "../migratable";
import { MultisigKey } from "../multisig-key";
import { SinglesigWallet } from "../singlesig-wallet";

export const ProxyAddress = migratable(
  z.object({
    address: z.string(),
    codeId: z.number().int().positive(),
  }),
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

const MultisigWalletData = migratable(
  z.object({
    chain: ChainIdSchema,
    owner: MultisigKey.schema.migratableSchema,
    signingPublicKey: z.string(),
    evmSigningAddress: z.string(),
    evmUserContractAddress: z.string(),
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
  }),
).addMigration({
  nextSchema: z.object({
    chain: ChainIdSchema,
    owner: MultisigKey.schema.migratableSchema,
    evmSigningAddress: z.string(),
    evmUserContractAddress: z.string(),
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
  }),
);
