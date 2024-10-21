import { PrimaryKeyEncryption } from "@/lib/encryption/primary-key";
import {
  BackupShare,
  EasyShare,
  EncryptedBackupShare,
  EncryptedEasyShareForClient,
  MultisigKey,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";

import { MultisigKeyEncryption } from "./multisig-key";

export class EasyShareEncryption {
  protected primaryKeyEncryption: PrimaryKeyEncryption;

  public constructor(protected readonly multisigKey: MultisigKey) {
    this.primaryKeyEncryption = new PrimaryKeyEncryption(multisigKey);
  }

  public async encrypt(share: EasyShare): Promise<EncryptedEasyShareForClient> {
    return EncryptedEasyShareForClient.parse(
      await this.primaryKeyEncryption.encrypt(serialize(share)),
    );
  }
}

export class SharesEncryptionForClient {
  protected easyEncryption: EasyShareEncryption;
  protected backupEncryption: MultisigKeyEncryption;

  public constructor(protected readonly multisigKey: MultisigKey) {
    this.easyEncryption = new EasyShareEncryption(multisigKey);
    this.backupEncryption = new MultisigKeyEncryption(multisigKey.publicKey);
  }

  public async encrypt(shares: {
    easy: EasyShare;
    backup: BackupShare;
  }): Promise<{
    easy: EncryptedEasyShareForClient;
    backup: EncryptedBackupShare;
  }>;
  public async encrypt(shares: {
    easy?: EasyShare;
    backup: BackupShare;
  }): Promise<{
    easy?: EncryptedEasyShareForClient | undefined;
    backup: EncryptedBackupShare;
  }>;
  public async encrypt(shares: { easy?: EasyShare; backup: BackupShare }) {
    const [easy, backup] = await Promise.all([
      shares.easy ? this.easyEncryption.encrypt(shares.easy) : undefined,
      this.backupEncryption.encrypt(serialize(shares.backup)),
    ]);
    return {
      easy,
      backup: EncryptedBackupShare.parse(backup),
    };
  }
}
