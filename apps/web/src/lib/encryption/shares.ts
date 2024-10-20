import { PrimaryKeyEncryption } from "@/lib/encryption/primary-key";
import { BackupShare, EasyShare, MultisigKey } from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";

import { MultisigKeyEncryption } from "./multisig-key";

export class EasyShareEncryption {
  protected primaryKeyEncryption: PrimaryKeyEncryption;

  public constructor(protected readonly multisigKey: MultisigKey) {
    this.primaryKeyEncryption = new PrimaryKeyEncryption(multisigKey);
  }

  public async encrypt(share: EasyShare): Promise<string> {
    return await this.primaryKeyEncryption.encrypt(serialize(share));
  }
}

export class SharesLocalEncryption {
  protected easyEncryption: EasyShareEncryption;
  protected backupEncryption: MultisigKeyEncryption;

  public constructor(protected readonly multisigKey: MultisigKey) {
    this.easyEncryption = new EasyShareEncryption(multisigKey);
    this.backupEncryption = new MultisigKeyEncryption(multisigKey.publicKey);
  }

  public async encrypt(shares: {
    easy: EasyShare;
    backup: BackupShare;
  }): Promise<{ easy: string; backup: string }>;
  public async encrypt(shares: {
    easy?: EasyShare;
    backup: BackupShare;
  }): Promise<{ easy?: string | undefined; backup: string }>;
  public async encrypt(shares: { easy?: EasyShare; backup: BackupShare }) {
    const [easy, backup] = await Promise.all([
      shares.easy ? this.easyEncryption.encrypt(shares.easy) : undefined,
      this.backupEncryption.encrypt(serialize(shares.backup)),
    ]);
    return {
      easy,
      backup,
    };
  }
}
