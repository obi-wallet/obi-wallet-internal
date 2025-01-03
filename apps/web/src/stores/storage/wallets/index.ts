import { PrimaryKeyEncryption, Secp256k1Decryption } from "@/lib/encryption";
import { easyShareToSecp256k1PublicKey } from "@/mpc";
import { Base64EncodedString } from "@obi-wallet/encoding";
import {
  createMigratableStorage,
  defaultStorage,
} from "@obi-wallet/headless-ui-store";
import {
  AbstractSerialized,
  EasyShare,
  EncryptedEasyShareForClient,
  KeySchema,
  LegacyKey,
  LegacyKeySchema,
  LegacyMpcWalletSchema,
  LegacyMpcWalletsSchema,
  LegacyMultisigKeySchema,
  Migratable,
  MpcWallets,
  MpcWalletSchema,
  MpcWalletsSchema,
  MultisigKey,
  MultisigKeySchema,
} from "@obi-wallet/sdk";
import { deserialize } from "@obi-wallet/sdk-json";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { Redacted } from "effect";
import { has } from "ramda";
import invariant from "tiny-invariant";
import { z } from "zod";

export const walletsStorage = createMigratableStorage<
  Migratable<MpcWallets>,
  z.infer<typeof MpcWalletsSchema>
>({
  storage: defaultStorage({
    prefix: "wallets-store",
    key: "mpc-wallets",
  }),
  migrate: async (data) => {
    if (!has("v", data)) {
      const current = LegacyMpcWalletsSchema.migratableSchema.parse(data);
      return MpcWalletsSchema.parse({
        v: 1,
        currentWalletIndex: current.currentWalletIndex,
        wallets: await Promise.all(current.wallets.map(migrateWallet)),
      });
    }

    return MpcWalletsSchema.parse(data);
  },
});

function migrateKey(
  data: AbstractSerialized<typeof LegacyKeySchema>,
): z.infer<typeof KeySchema> {
  const key = LegacyKey.create(data);
  return KeySchema.parse({
    type: key.type,
    publicKey: data.payload.publicKey,
  });
}

function migrateMultisigKey(
  data: AbstractSerialized<typeof LegacyMultisigKeySchema>,
): z.infer<typeof MultisigKeySchema> {
  return {
    keys: data.keys.map(migrateKey),
    primaryKeyIndex: data.primaryKeyIndex ?? null,
    threshold: data.threshold,
  };
}

export async function migrateWallet(
  data: AbstractSerialized<typeof LegacyMpcWalletSchema>,
): Promise<z.infer<typeof MpcWalletSchema>> {
  const primaryKeyIndex = data.owner.primaryKeyIndex ?? 0;
  const primaryKey = data.owner.keys[primaryKeyIndex];
  invariant(primaryKey, "Primary key not found");

  const primayKeyKeyPair = Secp256k1KeyPair.parse(primaryKey.payload);

  const easyShareDecryption = new Secp256k1Decryption(
    Base64EncodedString.parse(primayKeyKeyPair.privateKey),
  );

  const easyShare = Redacted.make(
    await easyShareDecryption.decrypt(data.encryptedShares.easy),
  );

  const owner = migrateMultisigKey(data.owner);
  const easyShareEncryption = new PrimaryKeyEncryption(
    MultisigKey.create(data.homeChain, owner),
  );
  const encryptedEasyShare = EncryptedEasyShareForClient.parse(
    await easyShareEncryption.encrypt(Redacted.value(easyShare)),
  );
  const secp256k1PublicKey = easyShareToSecp256k1PublicKey(
    EasyShare.parse(deserialize(Redacted.value(easyShare))),
  );
  Redacted.unsafeWipe(easyShare);

  return {
    homeChain: data.homeChain,
    owner: migrateMultisigKey(data.owner),
    userEntryAddress: data.userEntryAddress,
    encryptedShares: {
      easy: encryptedEasyShare,
      backup: data.encryptedShares.backup,
    },
    ed25519KeyPair: data.ed25519KeyPair ?? null,
    secp256k1KeyPair: {
      publicKey: secp256k1PublicKey.value,
    },
    previousWalletData: data.previousWalletData ?? null,
  };
}
