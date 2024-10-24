import {
  MultisigKeyDecryption,
  MultisigKeyEncryption,
} from "@/lib/encryption/multisig-key";
import {
  Secp256k1Decryption,
  Secp256k1Encryption,
} from "@/lib/encryption/secp256k1";
import { Base64EncodedString } from "@obi-wallet/encoding";
import {
  MultisigKey,
  parsePrimaryKeyEncryptedData,
  PrimaryKeyEncryptedData,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import invariant from "tiny-invariant";

export class PrimaryKeyEncryption {
  protected primaryKeyEncryption: Secp256k1Encryption;
  protected multisigKeyEncryption: MultisigKeyEncryption;

  public constructor(protected readonly multisigKey: MultisigKey) {
    const primaryKey = multisigKey.primaryKey;
    invariant(primaryKey, "Primary key is not available");
    this.primaryKeyEncryption = new Secp256k1Encryption(primaryKey.publicKey);
    this.multisigKeyEncryption = new MultisigKeyEncryption(
      multisigKey.publicKey,
    );
  }

  public async encrypt(data: string): Promise<PrimaryKeyEncryptedData> {
    return PrimaryKeyEncryptedData.parse(
      serialize([
        await this.primaryKeyEncryption.encrypt(data),
        await this.multisigKeyEncryption.encrypt(data),
      ]),
    );
  }
}

export class PrimaryKeyDecryption {
  public async decryptWithPrimaryKey({
    data,
    privateKey,
  }: {
    data: PrimaryKeyEncryptedData;
    privateKey: Base64EncodedString;
  }) {
    const [primaryKeyEncrypted, _multisigKeyEncrypted] =
      parsePrimaryKeyEncryptedData(data);
    return await new Secp256k1Decryption(privateKey).decrypt(
      primaryKeyEncrypted,
    );
  }

  public async decryptWithMultisigKey({
    data,
    input,
  }: {
    data: PrimaryKeyEncryptedData;
    input: (Base64EncodedString | null)[];
  }) {
    const [_primaryKeyEncrypted, multisigKeyEncrypted] =
      parsePrimaryKeyEncryptedData(data);
    return await new MultisigKeyDecryption(input).decrypt(multisigKeyEncrypted);
  }
}
