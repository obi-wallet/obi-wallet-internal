import { PrimaryKeyDecryption, PrimaryKeyEncryption } from "@/lib/encryption";
import {
  MOCK_MULTISIG_KEY_DATA,
  MOCK_PRIMARY_KEY_KEYPAIR,
  MOCK_RECOVERY_KEY_KEYPAIR,
} from "@/mocks/multisig-key";
import { mockApproveIntentions } from "@/tests/helpers/mock-approve-intentions";
import {
  handlePrimaryKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions/utils";
import { ObservableMultisigKey, SecretJsHomeChainId } from "@obi-wallet/sdk";
import { expect, test } from "vitest";

test("PrimaryKeyEncryption: decrypt with primary key", async () => {
  const multisigKey = ObservableMultisigKey.create(
    SecretJsHomeChainId.MAINNET,
    MOCK_MULTISIG_KEY_DATA,
  );

  const payload = "foo";
  const encryption = new PrimaryKeyEncryption(multisigKey);
  const encrypted = await encryption.encrypt(payload);

  const decryption = new PrimaryKeyDecryption();
  const decrypted = await decryption.decryptWithPrimaryKey({
    data: encrypted,
    privateKey: MOCK_PRIMARY_KEY_KEYPAIR.privateKey,
  });

  expect(decrypted).to.equal(payload);
});

test("PrimaryKeyEncryption: decrypt with multisig key", async () => {
  const multisigKey = ObservableMultisigKey.create(
    SecretJsHomeChainId.MAINNET,
    MOCK_MULTISIG_KEY_DATA,
  );

  const payload = "foo";
  const encryption = new PrimaryKeyEncryption(multisigKey);
  const encrypted = await encryption.encrypt(payload);

  const results: IntentionsResults = new Map();

  const intentions = {
    decryptEasyShare: null,
    decryptMultisigKeyEncryptedMessages: [],
    decryptPrimaryKeyEncryptedMessages: [encrypted],
    decryptMessages: [],
    signHashes: [],
  };

  // No shares provided, should fail
  await expect(
    handlePrimaryKeyDecryptedMessages({
      primaryKeyEncryptedMessages:
        intentions.decryptPrimaryKeyEncryptedMessages,
      multisigKey,
      results,
    }),
  ).rejects.toThrowError(
    "InvalidAccessError: invalid or too few shares provided",
  );

  // One key provided, should still fail
  await mockApproveIntentions({
    multisigKey,
    keyPair: MOCK_PRIMARY_KEY_KEYPAIR,
    intentions,
    results,
  });
  await expect(
    handlePrimaryKeyDecryptedMessages({
      primaryKeyEncryptedMessages:
        intentions.decryptPrimaryKeyEncryptedMessages,
      multisigKey,
      results,
    }),
  ).rejects.toThrowError(
    "InvalidAccessError: invalid or too few shares provided",
  );

  // Two keys provided, should succeed
  await mockApproveIntentions({
    multisigKey,
    keyPair: MOCK_RECOVERY_KEY_KEYPAIR,
    intentions,
    results,
  });

  const decrypted = await handlePrimaryKeyDecryptedMessages({
    primaryKeyEncryptedMessages: intentions.decryptPrimaryKeyEncryptedMessages,
    multisigKey,
    results,
  });

  expect(decrypted[0]).to.equal(payload);
});
