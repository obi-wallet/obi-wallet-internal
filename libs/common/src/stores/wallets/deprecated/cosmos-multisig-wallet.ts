import { pubkeyType } from "@cosmjs/amino";
import {
  Chain,
  createMultisigKey,
  KeyType,
  Migratable,
  MultisigWallet,
} from "@obi-wallet/sdk";
import { z } from "zod";

import { migratable } from "../../helpers";

export const SinglePublicKey = z.object({
  type: z.string(),
  value: z.string(),
});

export const Secp256k1PublicKey = z.object({
  type: z.literal(pubkeyType.secp256k1),
  value: z.string(),
});

export const MigratableSerializedBiometricsPayload = migratable(
  z.object({
    publicKey: z.string(),
  })
).addMigration({
  nextSchema: z.object({
    publicKey: Secp256k1PublicKey,
  }),
  migrate(data) {
    return {
      publicKey: {
        type: pubkeyType.secp256k1,
        value: data.publicKey,
      },
    };
  },
});

export const MigratableSerializedPhoneNumberPayload = migratable(
  z.object({
    publicKey: z.string(),
    phoneNumber: z.string(),
    securityQuestion: z.string(),
  })
).addMigration({
  nextSchema: z.object({
    publicKey: Secp256k1PublicKey,
    phoneNumber: z.string(),
    securityQuestion: z.string(),
  }),
  migrate(data) {
    return {
      ...data,
      publicKey: {
        type: pubkeyType.secp256k1,
        value: data.publicKey,
      },
    };
  },
});

export const SerializedSocialPayload = z.object({
  publicKey: SinglePublicKey,
});

export const MigratableSerializedMultisigPayload = migratable(
  z.object({
    biometrics: MigratableSerializedBiometricsPayload.schema.nullable(),
    phoneNumber: MigratableSerializedPhoneNumberPayload.schema.nullable(),
    cloud: z.null(),
  })
).addMigration({
  nextSchema: z.object({
    biometrics: MigratableSerializedBiometricsPayload.schema.nullable(),
    phoneNumber: MigratableSerializedPhoneNumberPayload.schema.nullable(),
    cloud: z.null(),
    social: SerializedSocialPayload.nullable(),
  }),
  migrate(data) {
    return {
      ...data,
      social: null,
    };
  },
});

export const MigratableSerializedProxyAddress = migratable(
  z.string()
).addMigration({
  nextSchema: z.object({
    address: z.string(),
    codeId: z.number(),
  }),
  migrate(data) {
    return {
      address: data,
      codeId: 2603,
    };
  },
});

export const SerializedProxyAddressPerChain = z
  .object({
    "uni-3": MigratableSerializedProxyAddress.schema.nullable(),
    "juno-1": MigratableSerializedProxyAddress.schema.nullable(),
  })
  .partial();

export const MigratableSerializedCosmosMultisigWalletData = migratable(
  z.object({
    nextAdmin: MigratableSerializedMultisigPayload.schema,
    currentAdmin: MigratableSerializedMultisigPayload.schema.nullable(),
    proxyAddress: MigratableSerializedProxyAddress.schema.nullable(),
  })
).addMigration({
  nextSchema: z.object({
    nextAdmin: MigratableSerializedMultisigPayload.schema,
    currentAdmin: MigratableSerializedMultisigPayload.schema.nullable(),
    proxyAddresses: SerializedProxyAddressPerChain,
  }),
  migrate(data) {
    return {
      ...data,
      proxyAddresses: {
        "uni-3": data.proxyAddress,
      },
    };
  },
});

export type SerializedCosmosMultisigWalletData = z.infer<
  typeof MigratableSerializedCosmosMultisigWalletData.schema
>;

export const MigratableSerializedCosmosMultisigWalletType = migratable(
  z.literal("multisig")
).addMigration({
  nextSchema: z.literal("cosmos-multisig"),
  migrate() {
    return "cosmos-multisig" as const;
  },
});

export const MigratableSerializedCosmosMultisigWallet = migratable(
  z.object({
    type: MigratableSerializedCosmosMultisigWalletType.schema,
    data: MigratableSerializedCosmosMultisigWalletData.schema,
  })
).addMigration({
  nextSchema: MultisigWallet.schema.currentSchema.nullable(),
  migrate(data) {
    const multisigWalletData = migrateSerializedData(data.data);
    if (multisigWalletData) {
      return MultisigWallet.schema.migratableSchema.parse({
        type: "multisig" as const,
        data: multisigWalletData,
      });
    }
    return null;
  },
});

export const MigratableSerializedCosmosMultisigDemoWalletType = migratable(
  z.literal("multisig-demo")
).addMigration({
  nextSchema: z.literal("cosmos-multisig-demo"),
  migrate() {
    return "cosmos-multisig-demo" as const;
  },
});

export const MigratableSerializedCosmosMultisigDemoWallet = migratable(
  z.object({
    type: MigratableSerializedCosmosMultisigDemoWalletType.schema,
    data: MigratableSerializedCosmosMultisigWalletData.schema,
  })
).addMigration({
  nextSchema: MultisigWallet.schema.currentSchema.nullable(),
  migrate(data) {
    const multisigWalletData = migrateSerializedData(data.data);
    if (multisigWalletData) {
      return MultisigWallet.schema.migratableSchema.parse({
        type: "multisig-demo" as const,
        data: multisigWalletData,
      });
    }
    return null;
  },
});

export function migrateSerializedData(
  serializedData: SerializedCosmosMultisigWalletData
): Migratable<typeof MultisigWallet>["data"] | null {
  const proxyAddresses = serializedData.proxyAddresses;
  const mainnetProxyAddress = proxyAddresses["juno-1"];
  const testnetProxyAddress = proxyAddresses["uni-3"];
  const proxyAddress = mainnetProxyAddress || testnetProxyAddress;
  const currentAdmin = serializedData.currentAdmin;

  if (!proxyAddress || !currentAdmin) return null;

  const chain = mainnetProxyAddress ? "juno-1" : "uni-3";

  return {
    chain,
    owner: migrateMultisigKey(chain, serializedData).toJSON(),
    proxyAddress,
  };

  function migrateMultisigKey(
    chain: Chain,
    { currentAdmin }: SerializedCosmosMultisigWalletData
  ) {
    const result = createMultisigKey(chain);
    if (currentAdmin?.biometrics) {
      result.setKey({
        type: KeyType.Device,
        payload: currentAdmin.biometrics,
      });
    }
    if (currentAdmin?.phoneNumber) {
      result.setKey({
        type: KeyType.Phone,
        payload: currentAdmin.phoneNumber,
      });
    }
    if (currentAdmin?.social) {
      result.setKey({
        type: KeyType.Social,
        // @ts-expect-error TODO: review
        payload: currentAdmin.social,
      });
    }
    return result;
  }
}
