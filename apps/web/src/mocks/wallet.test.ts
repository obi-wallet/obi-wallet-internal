import {
  IntentionsPayload,
  IntentionsResult,
  KeyPairIntentionsHandler,
} from "@/keys/intentions-handler";
import {
  MultisigKeyEncryption,
  SharesEncryptionForClient,
} from "@/lib/encryption";
import { MOCK_PRIMARY_KEY_KEYPAIR } from "@/mocks/multisig-key";
import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import {
  handleEncryptedEasyShare,
  handleMultisigKeyDecryptedMessage,
} from "@/user-interactions/approve-intentions/utils";
import { Base64EncodedString } from "@obi-wallet/encoding";
import {
  BackupShare,
  KeyType,
  MpcWallet,
  MultisigKey,
  SecretJsHomeChainId,
} from "@obi-wallet/sdk";
import { deserialize, serialize } from "@obi-wallet/sdk-json";
import { test } from "vitest";

// This should only be enabled temporarily if you want to re-encrypt the shares and the Ed25519 private key of the mock wallet
// for a new wallet (e.g., one with another multisig) for use in tests and storybook.
test.skip("Re-encrypt MPC shares and Ed25519 private key", async () => {
  const sourceWallet = MpcWallet.create(MOCK_WALLET_DATA);
  const targetOwner = MultisigKey.create(SecretJsHomeChainId.MAINNET, {
    threshold: 1,
    primaryKeyIndex: 0,
    keys: [
      {
        type: KeyType.Passkey,
        publicKey: MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
      },
      {
        type: KeyType.Telegram,
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: Base64EncodedString.parse(
            "AiZCSwpXotTczWZ/lLB6RVafggyui4tAZF+zCsFu3IdB",
          ),
        },
      },
    ],
  });

  const intention: IntentionsPayload = {
    decryptShares: {
      easy: sourceWallet.encryptedEasyShare,
      backup: null,
      network: null,
    },
    signHashes: [],
    decryptPrimaryKeyEncryptedMessages: [],
    decryptMessages: [],
    decryptMultisigKeyEncryptedMessages: [
      sourceWallet.encryptedBackupShare,
      sourceWallet.encryptedEd25519PrivateKey!,
    ],
  };
  const { intentionsResult } = await new KeyPairIntentionsHandler({
    owner: sourceWallet.owner,
    payload: intention,
    keyPair: MOCK_PRIMARY_KEY_KEYPAIR,
    type: KeyType.Passkey,
  }).handle();
  const results = new Map<string, IntentionsResult>([
    [MOCK_PRIMARY_KEY_KEYPAIR.publicKey.value, intentionsResult],
  ]);
  const easyShare = await handleEncryptedEasyShare({
    encryptedEasyShare: sourceWallet.encryptedEasyShare,
    multisigKey: sourceWallet.owner,
    results,
  });
  const backupShare = BackupShare.parse(
    deserialize(
      await handleMultisigKeyDecryptedMessage({
        multisigKey: sourceWallet.owner,
        results,
        index: 0,
        multisigKeyEncryptedMessage: sourceWallet.encryptedBackupShare,
      }),
    ),
  );
  const ed25519PrivateKey = await handleMultisigKeyDecryptedMessage({
    multisigKey: sourceWallet.owner,
    results,
    index: 1,
    multisigKeyEncryptedMessage: sourceWallet.encryptedEd25519PrivateKey!,
  });

  const encryptedShares = await new SharesEncryptionForClient(
    targetOwner,
  ).encrypt({
    easy: easyShare,
    backup: backupShare,
  });
  const encryptedEd25519PrivateKey = await new MultisigKeyEncryption(
    targetOwner.publicKey,
  ).encrypt(ed25519PrivateKey);

  const encryptedEasyShareForBackup = await new MultisigKeyEncryption(
    targetOwner.publicKey,
  ).encrypt(serialize(easyShare));

  console.log("-- Encrypted easy share for client--");
  console.log(encryptedShares.easy);
  console.log("-- Encrypted backup share --");
  console.log(encryptedShares.backup);
  console.log("-- Encrypted easy share for backup --");
  console.log(encryptedEasyShareForBackup);
  console.log("-- Encrypted ed25519 private key --");
  console.log(encryptedEd25519PrivateKey);
});
