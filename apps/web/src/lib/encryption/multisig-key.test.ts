import { MultisigKeyEncryption } from "@/lib/encryption/multisig-key";
import {
  MOCK_MULTISIG_KEY_DATA,
  MOCK_PRIMARY_KEY_KEYPAIR,
  MOCK_RECOVERY_KEY_KEYPAIR,
} from "@/mocks/multisig-key";
import { mockApproveIntentions } from "@/tests/helpers/mock-approve-intentions";
import {
  handleMultisigKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions/utils";
import { ObservableMultisigKey, SecretJsHomeChainId } from "@obi-wallet/sdk";
import { expect, test } from "vitest";

test("MultisigKeyEncryption", async () => {
  const multisigKey = ObservableMultisigKey.create(
    SecretJsHomeChainId.MAINNET,
    MOCK_MULTISIG_KEY_DATA,
  );

  const payload = "foo";
  const encryption = new MultisigKeyEncryption(multisigKey.publicKey);
  const encrypted = await encryption.encrypt(payload);

  const results: IntentionsResults = new Map();

  const intentions = {
    decryptEasyShare: null,
    decryptMultisigKeyEncryptedMessages: [encrypted],
    decryptPrimaryKeyEncryptedMessages: [],
    decryptMessages: [],
    signHashes: [],
  };

  // No shares provided, should fail
  await expect(
    handleMultisigKeyDecryptedMessages({
      multisigKeyEncryptedMessages:
        intentions.decryptMultisigKeyEncryptedMessages,
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
    handleMultisigKeyDecryptedMessages({
      multisigKeyEncryptedMessages:
        intentions.decryptMultisigKeyEncryptedMessages,
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
  const decrypted = await handleMultisigKeyDecryptedMessages({
    multisigKeyEncryptedMessages:
      intentions.decryptMultisigKeyEncryptedMessages,
    multisigKey,
    results,
  });

  expect(decrypted[0]).to.equal(payload);
});
