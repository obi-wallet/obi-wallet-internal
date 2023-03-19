import { pubkeyType } from "@cosmjs/amino";
import { z } from "zod";

import { Chain } from "../../../../chains";
import { Secp256k1PublicKey } from "../../../../keys";
import { Migratable } from "../../../abstract";
import { AbstractSerialized, migratable } from "../../../migratable";
import { createMultisigKey, KeyType } from "../../../multisig-key";
import { MultisigWallet } from "../../../multisig-wallet";

const SinglePublicKey = z.object({
  type: z.string(),
  value: z.string(),
});

const MigratableSerializedBiometricsPayload = migratable(
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

const MigratableSerializedPhoneNumberPayload = migratable(
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

const SerializedSocialPayload = z.object({
  publicKey: SinglePublicKey,
});

const MigratableSerializedMultisigPayload = migratable(
  z.object({
    biometrics:
      MigratableSerializedBiometricsPayload.migratableSchema.nullable(),
    phoneNumber:
      MigratableSerializedPhoneNumberPayload.migratableSchema.nullable(),
    cloud: z.null(),
  })
).addMigration({
  nextSchema: z.object({
    biometrics:
      MigratableSerializedBiometricsPayload.migratableSchema.nullable(),
    phoneNumber:
      MigratableSerializedPhoneNumberPayload.migratableSchema.nullable(),
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

const MigratableSerializedProxyAddress = migratable(z.string()).addMigration({
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

const SerializedProxyAddressPerChain = z
  .object({
    "uni-3": MigratableSerializedProxyAddress.migratableSchema.nullable(),
    "juno-1": MigratableSerializedProxyAddress.migratableSchema.nullable(),
  })
  .partial();

const MigratableSerializedCosmosMultisigWalletData = migratable(
  z.object({
    nextAdmin: MigratableSerializedMultisigPayload.migratableSchema,
    currentAdmin:
      MigratableSerializedMultisigPayload.migratableSchema.nullable(),
    proxyAddress: MigratableSerializedProxyAddress.migratableSchema.nullable(),
  })
).addMigration({
  nextSchema: z.object({
    nextAdmin: MigratableSerializedMultisigPayload.migratableSchema,
    currentAdmin:
      MigratableSerializedMultisigPayload.migratableSchema.nullable(),
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

const MigratableSerializedCosmosMultisigWalletType = migratable(
  z.literal("multisig")
).addMigration({
  nextSchema: z.literal("cosmos-multisig"),
  migrate() {
    return "cosmos-multisig" as const;
  },
});

const MigratableSerializedCosmosMultisigWallet = migratable(
  z.object({
    type: MigratableSerializedCosmosMultisigWalletType.migratableSchema,
    data: MigratableSerializedCosmosMultisigWalletData.migratableSchema,
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

const MigratableSerializedCosmosMultisigDemoWalletType = migratable(
  z.literal("multisig-demo")
).addMigration({
  nextSchema: z.literal("cosmos-multisig-demo"),
  migrate() {
    return "cosmos-multisig-demo" as const;
  },
});

const MigratableSerializedCosmosMultisigDemoWallet = migratable(
  z.object({
    type: MigratableSerializedCosmosMultisigDemoWalletType.migratableSchema,
    data: MigratableSerializedCosmosMultisigWalletData.migratableSchema,
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

export const DeprecatedCosmosMultisigWallet =
  MigratableSerializedCosmosMultisigWallet;
export const DeprecatedCosmosMultisigDemoWallet =
  MigratableSerializedCosmosMultisigDemoWallet;

function migrateSerializedData(
  serializedData: AbstractSerialized<
    typeof MigratableSerializedCosmosMultisigWalletData
  >
): Migratable<MultisigWallet>["data"] | null {
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
    {
      currentAdmin,
    }: AbstractSerialized<typeof MigratableSerializedCosmosMultisigWalletData>
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
