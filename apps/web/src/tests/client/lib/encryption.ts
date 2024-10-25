import {
  IntentionsPayload,
  KeyPairIntentionsHandler,
} from "@/keys/intentions-handler";
import { PrimaryKeyDecryption, PrimaryKeyEncryption } from "@/lib/encryption";
import {
  MOCK_MULTISIG_KEY_DATA,
  MOCK_PRIMARY_KEY_KEYPAIR,
  MOCK_RECOVERY_KEY_KEYPAIR,
} from "@/mocks/multisig-key";
import { createTestSuite, expect } from "@/tests";
import {
  handlePrimaryKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions/utils";
import {
  MultisigKey,
  ObservableMultisigKey,
  SecretJsHomeChainId,
} from "@obi-wallet/sdk";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";

export async function mockApproveIntentions({
  multisigKey,
  keyPair,
  intentions,
  results,
}: {
  multisigKey: MultisigKey;
  keyPair: Secp256k1KeyPair;
  intentions: IntentionsPayload;
  results: IntentionsResults;
}) {
  const intentionsHandler = new KeyPairIntentionsHandler({
    owner: multisigKey,
    payload: intentions,
    keyPair,
    type: null,
  });
  const { intentionsResult, publicKey } = await intentionsHandler.handle();
  results.set(publicKey, intentionsResult);
}

export const testSuite = createTestSuite(({ test }) => {
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
    try {
      await handlePrimaryKeyDecryptedMessages({
        primaryKeyEncryptedMessages:
          intentions.decryptPrimaryKeyEncryptedMessages,
        multisigKey,
        results,
      });
      throw new Error("Expected to fail");
    } catch (e) {
      expect(e).to.equal(
        "InvalidAccessError: invalid or too few shares provided",
      );
    }

    // One key provided, should still fail
    await mockApproveIntentions({
      multisigKey,
      keyPair: MOCK_PRIMARY_KEY_KEYPAIR,
      intentions,
      results,
    });
    try {
      await handlePrimaryKeyDecryptedMessages({
        primaryKeyEncryptedMessages:
          intentions.decryptPrimaryKeyEncryptedMessages,
        multisigKey,
        results,
      });
      throw new Error("Expected to fail");
    } catch (e) {
      expect(e).to.equal(
        "InvalidAccessError: invalid or too few shares provided",
      );
    }

    // Two keys provided, should succeed
    await mockApproveIntentions({
      multisigKey,
      keyPair: MOCK_RECOVERY_KEY_KEYPAIR,
      intentions,
      results,
    });

    const decrypted = await handlePrimaryKeyDecryptedMessages({
      primaryKeyEncryptedMessages:
        intentions.decryptPrimaryKeyEncryptedMessages,
      multisigKey,
      results,
    });

    expect(decrypted[0]).to.equal(payload);
  });
});
