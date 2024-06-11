import { Base64EncodedString } from "@obi-wallet/encoding";
import { BackupShare, EasyShare, MultisigKey } from "@obi-wallet/sdk";
import { deserialize, serialize } from "@obi-wallet/sdk-json";
import invariant from "tiny-invariant";

import { MultisigKeyEncryption } from "./multisig-key";
import { Secp256k1Decryption, Secp256k1Encryption } from "./secp256k1";

export class EasyShareDecryption {
  protected primaryKeyDecryption: Secp256k1Decryption;

  public constructor(protected readonly multisigKey: MultisigKey) {
    const primaryKey = multisigKey.primaryKey;
    invariant(primaryKey, "Primary key is not available");
    this.primaryKeyDecryption = new Secp256k1Decryption(
      primaryKey.payload.privateKey,
    );
  }

  public async decrypt(share: Base64EncodedString) {
    return EasyShare.parse(
      deserialize(await this.primaryKeyDecryption.decrypt(share)),
    );
  }
}

export class EasyShareEncryption {
  protected primaryKeyEncryption: Secp256k1Encryption;

  public constructor(protected readonly multisigKey: MultisigKey) {
    const primaryKey = multisigKey.primaryKey;
    invariant(primaryKey, "Primary key is not available");
    this.primaryKeyEncryption = new Secp256k1Encryption(
      primaryKey.payload.publicKey,
    );
  }

  public async encrypt(share: EasyShare): Promise<Base64EncodedString> {
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
  }): Promise<{ easy: Base64EncodedString; backup: string }>;
  public async encrypt(shares: {
    easy?: EasyShare;
    backup: BackupShare;
  }): Promise<{ easy?: string; backup: string }>;
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

export class SharesBackupEncryption {
  protected easyEncryption: MultisigKeyEncryption;
  protected backupEncryption: MultisigKeyEncryption;

  public constructor(protected readonly multisigKey: MultisigKey) {
    this.easyEncryption = new MultisigKeyEncryption(multisigKey.publicKey);
    this.backupEncryption = new MultisigKeyEncryption(multisigKey.publicKey);
  }

  public async encrypt(shares: {
    easy: EasyShare;
    backup: BackupShare;
  }): Promise<{ easy: string; backup: string }>;
  public async encrypt(shares: {
    easy?: EasyShare;
    backup: BackupShare;
  }): Promise<{ easy?: string; backup: string }>;
  public async encrypt(shares: { easy?: EasyShare; backup: BackupShare }) {
    const [easy, backup] = await Promise.all([
      shares.easy ? this.encryptEasyShare(shares.easy) : undefined,
      this.backupEncryption.encrypt(serialize(shares.backup)),
    ]);
    return {
      easy,
      backup,
    };
  }

  public async encryptEasyShare(share: EasyShare) {
    return await this.easyEncryption.encrypt(serialize(share));
  }
}
