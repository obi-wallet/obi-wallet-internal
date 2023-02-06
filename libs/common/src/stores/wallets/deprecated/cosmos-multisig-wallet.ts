import { pubkeyType } from "@cosmjs/amino";
import * as t from "io-ts";

import { migratable, nullable } from "../../helpers";
import { MultisigKey } from "../multisig-key";
import {
  MigratableSerializedMultisigDemoWallet,
  MigratableSerializedMultisigWallet,
  MigratableSerializedMultisigWalletData,
} from "../multisig-wallet/serialized-data";

export const SinglePublicKey = t.type({
  type: t.string,
  value: t.string,
});

export const Secp256k1PublicKey = t.type({
  type: t.literal(pubkeyType.secp256k1),
  value: t.string,
});

export const MigratableSerializedBiometricsPayload = migratable(
  t.type({
    publicKey: t.string,
  })
).addMigration({
  nextVersion: t.type({
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
  t.type({
    publicKey: t.string,
    phoneNumber: t.string,
    securityQuestion: t.string,
  })
).addMigration({
  nextVersion: t.type({
    publicKey: Secp256k1PublicKey,
    phoneNumber: t.string,
    securityQuestion: t.string,
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

export const SerializedSocialPayload = t.type({
  publicKey: SinglePublicKey,
});

export const MigratableSerializedMultisigPayload = migratable(
  t.type({
    biometrics: nullable(MigratableSerializedBiometricsPayload.anyVersion),
    phoneNumber: nullable(MigratableSerializedPhoneNumberPayload.anyVersion),
    cloud: t.null,
  })
)
  .addMigration({
    nextVersion: t.type({
      biometrics: nullable(MigratableSerializedBiometricsPayload.anyVersion),
      phoneNumber: nullable(MigratableSerializedPhoneNumberPayload.anyVersion),
      cloud: t.null,
      social: nullable(SerializedSocialPayload),
    }),
    migrate(data) {
      return {
        ...data,
        social: null,
      };
    },
  })
  .addMigration({
    nextVersion: t.type({
      biometrics: nullable(
        MigratableSerializedBiometricsPayload.currentVersion
      ),
      phoneNumber: nullable(
        MigratableSerializedPhoneNumberPayload.currentVersion
      ),
      cloud: t.null,
      social: nullable(SerializedSocialPayload),
    }),
    migrate(data) {
      return {
        ...data,
        biometrics: data.biometrics
          ? MigratableSerializedBiometricsPayload.migrate(data.biometrics)
          : null,
        phoneNumber: data.phoneNumber
          ? MigratableSerializedPhoneNumberPayload.migrate(data.phoneNumber)
          : null,
      };
    },
  });

export const MigratableSerializedProxyAddress = migratable(
  t.string
).addMigration({
  nextVersion: t.type({
    address: t.string,
    codeId: t.number,
  }),
  migrate(data) {
    return {
      address: data,
      codeId: 2603,
    };
  },
});

export const SerializedProxyAddressPerChain = t.partial({
  "uni-3": nullable(MigratableSerializedProxyAddress.currentVersion),
  "juno-1": nullable(MigratableSerializedProxyAddress.currentVersion),
});

export const MigratableSerializedCosmosMultisigWalletData = migratable(
  t.type({
    nextAdmin: MigratableSerializedMultisigPayload.anyVersion,
    currentAdmin: nullable(MigratableSerializedMultisigPayload.anyVersion),
    proxyAddress: nullable(MigratableSerializedProxyAddress.anyVersion),
  })
).addMigration({
  nextVersion: t.type({
    nextAdmin: MigratableSerializedMultisigPayload.currentVersion,
    currentAdmin: nullable(MigratableSerializedMultisigPayload.currentVersion),
    proxyAddresses: SerializedProxyAddressPerChain,
  }),
  migrate(data) {
    return {
      nextAdmin: MigratableSerializedMultisigPayload.migrate(data.nextAdmin),
      currentAdmin: data.currentAdmin
        ? MigratableSerializedMultisigPayload.migrate(data.currentAdmin)
        : null,
      proxyAddresses: {
        "uni-3": data.proxyAddress
          ? MigratableSerializedProxyAddress.migrate(data.proxyAddress)
          : null,
      },
    };
  },
});

export type SerializedCosmosMultisigWalletData = t.TypeOf<
  typeof MigratableSerializedCosmosMultisigWalletData.currentVersion
>;

export const MigratableSerializedCosmosMultisigWalletType = migratable(
  t.literal("multisig")
).addMigration({
  nextVersion: t.literal("cosmos-multisig"),
  migrate() {
    return "cosmos-multisig" as const;
  },
});

export const MigratableSerializedCosmosMultisigWallet = migratable(
  t.type({
    type: MigratableSerializedCosmosMultisigWalletType.anyVersion,
    data: MigratableSerializedCosmosMultisigWalletData.anyVersion,
  })
)
  .addMigration({
    nextVersion: t.type({
      type: MigratableSerializedCosmosMultisigWalletType.currentVersion,
      data: MigratableSerializedCosmosMultisigWalletData.currentVersion,
    }),
    migrate(data) {
      return {
        type: MigratableSerializedCosmosMultisigWalletType.migrate(data.type),
        data: MigratableSerializedCosmosMultisigWalletData.migrate(data.data),
      };
    },
  })
  .addMigration({
    nextVersion: nullable(MigratableSerializedMultisigWallet.currentVersion),
    migrate(data) {
      const multisigWalletData = migrateSerializedData(data.data);
      if (multisigWalletData) {
        return MigratableSerializedMultisigWallet.migrate({
          type: "multisig",
          data: multisigWalletData,
        });
      }
      return null;
    },
  });

export const MigratableSerializedCosmosMultisigDemoWalletType = migratable(
  t.literal("multisig-demo")
).addMigration({
  nextVersion: t.literal("cosmos-multisig-demo"),
  migrate() {
    return "cosmos-multisig-demo" as const;
  },
});

export const MigratableSerializedCosmosMultisigDemoWallet = migratable(
  t.type({
    type: MigratableSerializedCosmosMultisigDemoWalletType.anyVersion,
    data: MigratableSerializedCosmosMultisigWalletData.anyVersion,
  })
)
  .addMigration({
    nextVersion: t.type({
      type: MigratableSerializedCosmosMultisigDemoWalletType.currentVersion,
      data: MigratableSerializedCosmosMultisigWalletData.currentVersion,
    }),
    migrate(data) {
      return {
        type: MigratableSerializedCosmosMultisigDemoWalletType.migrate(
          data.type
        ),
        data: MigratableSerializedCosmosMultisigWalletData.migrate(data.data),
      };
    },
  })
  .addMigration({
    nextVersion: nullable(
      MigratableSerializedMultisigDemoWallet.currentVersion
    ),
    migrate(data) {
      const multisigWalletData = migrateSerializedData(data.data);
      if (multisigWalletData) {
        return MigratableSerializedMultisigDemoWallet.migrate({
          type: "multisig-demo",
          data: multisigWalletData,
        });
      }
      return null;
    },
  });

export function migrateSerializedData(
  serializedData: SerializedCosmosMultisigWalletData
): t.TypeOf<typeof MigratableSerializedMultisigWalletData.anyVersion> | null {
  const proxyAddresses = serializedData.proxyAddresses;
  const mainnetProxyAddress = proxyAddresses["juno-1"];
  const testnetProxyAddress = proxyAddresses["uni-3"];
  const proxyAddress = mainnetProxyAddress || testnetProxyAddress;
  const currentAdmin = serializedData.currentAdmin;

  if (!proxyAddress || !currentAdmin) return null;

  const chain = mainnetProxyAddress ? "juno-1" : "uni-3";

  const multisigKey = new MultisigKey({ chain });
  if (currentAdmin.biometrics) {
    multisigKey.setDeviceKey(currentAdmin.biometrics);
  }
  if (currentAdmin.phoneNumber) {
    multisigKey.setPhoneKey(currentAdmin.phoneNumber);
  }
  if (currentAdmin.social) {
    // @ts-expect-error TODO: review
    multisigKey.setSocialKey(currentAdmin.social);
  }

  return {
    chain,
    owner: multisigKey.serialize(),
    proxyAddress,
  };
}
