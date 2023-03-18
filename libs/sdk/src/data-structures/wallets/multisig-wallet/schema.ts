import { z } from "zod";

import { Secp256k1PublicKey } from "../../../keys";
import { ArrayIndex } from "../../array-index";
import { migratable } from "../../migratable";
import { createGatekeeperConfig, GatekeeperConfig } from "../gatekeeper-config";
import { MultisigKey } from "../multisig-key";

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

export const SinglesigWallet = migratable(
  z.object({
    type: z.literal("singlesig-wallet"),
    publicKey: Secp256k1PublicKey,
    privateKey: z.string(),
  })
);

export const CurrentAccount = migratable(
  z.object({
    type: z.union([z.literal("flex-account"), z.literal("singlesig-wallet")]),
    index: ArrayIndex,
  })
);

const MultisigWalletData = migratable(
  z.object({
    chain: Chain,
    owner: MultisigKey.schema.migratableSchema,
    proxyAddress: ProxyAddress.migratableSchema,
  })
)
  .addMigration({
    nextSchema: z.object({
      chain: Chain,
      owner: MultisigKey.schema.migratableSchema,
      proxyAddress: ProxyAddress.migratableSchema,
      gatekeeperConfig: GatekeeperConfig.schema.migratableSchema,
      singlesigWallets: z.array(SinglesigWallet.migratableSchema),
    }),
    migrate(data) {
      const gatekeeperConfig = createGatekeeperConfig();
      return {
        ...data,
        gatekeeperConfig: gatekeeperConfig.toJSON(),
        singlesigWallets: [],
      };
    },
  })
  .addMigration({
    nextSchema: z.object({
      chain: Chain,
      owner: MultisigKey.schema.migratableSchema,
      proxyAddress: ProxyAddress.migratableSchema,
      gatekeeperConfig: GatekeeperConfig.schema.migratableSchema,
      singlesigWallets: z.array(SinglesigWallet.migratableSchema),
      currentAccount: CurrentAccount.migratableSchema.nullable(),
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
