import { IntentionsResult } from "@/keys/intentions-handler";
import { MultisigKeyDecryption, PrimaryKeyDecryption } from "@/lib/encryption";
import { EasyShare, MultisigKey } from "@obi-wallet/sdk";
import { deserialize } from "@obi-wallet/sdk-json";

export const IntentionsResults = Map<string, IntentionsResult>;
export type IntentionsResults = Map<string, IntentionsResult>;

export async function handleMultisigKeyDecryptedMessages({
  multisigKeyEncryptedMessages,
  multisigKey,
  results,
}: {
  multisigKeyEncryptedMessages: string[];
  multisigKey: MultisigKey;
  results: IntentionsResults;
}): Promise<string[]> {
  return await Promise.all(
    multisigKeyEncryptedMessages.map(async (message, index) => {
      return await handleMultisigKeyDecryptedMessage({
        multisigKeyEncryptedMessage: message,
        multisigKey,
        results,
        index,
      });
    }),
  );
}

export async function handleMultisigKeyDecryptedMessage({
  multisigKeyEncryptedMessage,
  multisigKey,
  results,
  index,
}: {
  multisigKeyEncryptedMessage: string;
  multisigKey: MultisigKey;
  results: IntentionsResults;
  index: number;
}) {
  const decryptedShares = multisigKey.keys.map((key) => {
    return (
      results.get(key.publicKey.value)
        ?.decryptedMultisigKeyEncryptedMessagesShares[index] ?? null
    );
  });
  const decryption = new MultisigKeyDecryption(decryptedShares);
  return await decryption.decrypt(multisigKeyEncryptedMessage);
}

export async function handlePrimaryKeyDecryptedMessages({
  primaryKeyEncryptedMessages,
  multisigKey,
  results,
}: {
  primaryKeyEncryptedMessages: string[];
  multisigKey: MultisigKey;
  results: IntentionsResults;
}) {
  return await Promise.all(
    primaryKeyEncryptedMessages.map(async (message, index) => {
      return await handlePrimaryKeyDecryptedMessage({
        primaryKeyEncryptedMessage: message,
        multisigKey,
        results,
        index,
      });
    }),
  );
}

export async function handlePrimaryKeyDecryptedMessage({
  primaryKeyEncryptedMessage,
  multisigKey,
  results,
  index,
}: {
  primaryKeyEncryptedMessage: string;
  multisigKey: MultisigKey;
  results: IntentionsResults;
  index: number;
}) {
  const decryptedShares = multisigKey.keys.map((key) => {
    return (
      results.get(key.publicKey.value)
        ?.decryptedPrimaryKeyEncryptedMessagesShares[index] ?? null
    );
  });
  return await new PrimaryKeyDecryption().decryptWithMultisigKey({
    data: primaryKeyEncryptedMessage,
    input: decryptedShares,
  });
}

export async function handleEncryptedEasyShare({
  encryptedEasyShare,
  multisigKey,
  results,
}: {
  encryptedEasyShare: string;
  multisigKey: MultisigKey;
  results: IntentionsResults;
}) {
  const decryptedShares = multisigKey.keys.map((key) => {
    return results.get(key.publicKey.value)?.decryptedEasyShareShare ?? null;
  });
  return EasyShare.parse(
    deserialize(
      await new PrimaryKeyDecryption().decryptWithMultisigKey({
        data: encryptedEasyShare,
        input: decryptedShares,
      }),
    ),
  );
}
