import { IntentionsPayload } from "@/keys/intentions-handler";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import {
  BackupShare,
  EasyShare,
  EncryptedBackupShare,
  EncryptedEasyShareForBackup,
  EncryptedEasyShareForClient,
  MultisigKey,
  MultisigKeyEncryptedData,
} from "@obi-wallet/sdk";

export interface EncryptionTools {
  encryptSharesForClient: (payload: {
    multisigKey: MultisigKey;
    easy: EasyShare;
    backup: BackupShare;
  }) => Promise<{
    easy: EncryptedEasyShareForClient;
    backup: EncryptedBackupShare;
  }>;
  encryptSharesForBackup: (payload: {
    multisigKey: MultisigKey;
    easy: EasyShare;
    backup: BackupShare;
  }) => Promise<{
    easy: EncryptedEasyShareForBackup;
    backup: EncryptedBackupShare;
  }>;
  encryptWithMultisigKey: (payload: {
    multisigKey: MultisigKey;
    data: string;
  }) => Promise<MultisigKeyEncryptedData>;
  handleIntentions: (payload: {
    multisigKey: MultisigKey;
    intentionsPayload: IntentionsPayload;
    results: IntentionsResults;
  }) => Promise<{
    decryptedEasyShare: EasyShare | null;
    decryptedPrimaryKeyEncryptedMessages: string[];
    decryptedMultisigKeyEncryptedMessages: string[];
  }>;
}
