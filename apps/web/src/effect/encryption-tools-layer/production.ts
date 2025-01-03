import {
  MultisigKeyEncryption,
  SharesEncryptionForClient,
} from "@/lib/encryption";
import {
  handleEncryptedBackupShare,
  handleEncryptedEasyShare,
  handleEncryptedNetworkShare,
  handleMultisigKeyDecryptedMessages,
  handlePrimaryKeyDecryptedMessages,
} from "@/user-interactions/approve-intentions/utils";
import {
  EncryptedBackupShare,
  EncryptedEasyShareForBackup,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import { Layer } from "effect";

import { EncryptionTools } from "./context-tag";

export const encryptionToolsLayer = Layer.succeed(EncryptionTools, {
  encryptSharesForClient: async function ({ multisigKey, easy, backup }) {
    return await new SharesEncryptionForClient(multisigKey).encrypt({
      easy,
      backup,
    });
  },
  encryptSharesForBackup: async function ({ multisigKey, easy, backup }) {
    const multisigKeyEncryption = new MultisigKeyEncryption(
      multisigKey.publicKey,
    );
    return {
      easy: EncryptedEasyShareForBackup.parse(
        await multisigKeyEncryption.encrypt(serialize(easy)),
      ),
      backup: EncryptedBackupShare.parse(
        await multisigKeyEncryption.encrypt(serialize(backup)),
      ),
    };
  },
  encryptWithMultisigKey: async function ({ multisigKey, data }) {
    return await new MultisigKeyEncryption(multisigKey.publicKey).encrypt(data);
  },
  handleIntentions: async function ({
    multisigKey,
    intentionsPayload,
    results,
  }) {
    return {
      decryptedShares: {
        easy: intentionsPayload.decryptShares?.easy
          ? await handleEncryptedEasyShare({
              multisigKey,
              encryptedEasyShare: intentionsPayload.decryptShares.easy,
              results,
            })
          : null,
        backup: intentionsPayload.decryptShares?.backup
          ? await handleEncryptedBackupShare({
              multisigKey,
              encryptedBackupShare: intentionsPayload.decryptShares.backup,
              results,
            })
          : null,
        network: intentionsPayload.decryptShares?.network
          ? await handleEncryptedNetworkShare({
              multisigKey,
              encryptedNetworkShare: intentionsPayload.decryptShares.network,
              results,
            })
          : null,
      },
      decryptedPrimaryKeyEncryptedMessages:
        await handlePrimaryKeyDecryptedMessages({
          primaryKeyEncryptedMessages:
            intentionsPayload.decryptPrimaryKeyEncryptedMessages,
          multisigKey,
          results,
        }),
      decryptedMultisigKeyEncryptedMessages:
        await handleMultisigKeyDecryptedMessages({
          multisigKeyEncryptedMessages:
            intentionsPayload.decryptMultisigKeyEncryptedMessages,
          multisigKey,
          results,
        }),
    };
  },
});
