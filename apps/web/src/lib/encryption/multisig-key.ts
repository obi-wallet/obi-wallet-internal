import { MultisigPublicKey } from "@obi-wallet/sdk";
import { SHA256, Word32Array } from "jscrypto";
import * as sss from "sss-wasm";

import { AesGcmDecryption, AesGcmEncryption } from "./aes-gcm";
import { Secp256k1Encryption } from "./secp256k1";

export class MultisigKeyEncryption {
  public constructor(protected readonly multisigPublicKey: MultisigPublicKey) {}

  public async encrypt(data: string): Promise<string> {
    // Generate a random secret that will be split into shares using SSS.
    const sssSecret = window.crypto.getRandomValues(new Uint8Array(64));

    const totalShares = this.multisigPublicKey.value.pubkeys.length;
    const threshold = parseInt(this.multisigPublicKey.value.threshold, 10);
    const shares = await sss.createShares(sssSecret, totalShares, threshold);
    const encryptedShares = await Promise.all(
      shares.map(async (share, index) => {
        const encryption = new Secp256k1Encryption(
          this.multisigPublicKey.value.pubkeys[index]!,
        );
        return await encryption.encrypt(Buffer.from(share).toString("base64"));
      }),
    );

    // For the actual encryption, we only need 256 bits, so we use SHA256 to hash the secret.
    const raw = SHA256.hash(new Word32Array(sssSecret)).toUint8Array();
    const key = await window.crypto.subtle.importKey(
      "raw",
      raw,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"],
    );

    return JSON.stringify([
      await new AesGcmEncryption(key).encrypt(data),
      ...encryptedShares,
    ]);
  }
}

export class MultisigKeyDecryption {
  public constructor(protected readonly input: (string | null)[]) {}

  public async decrypt(data: string): Promise<string> {
    const [encrypted, ..._encryptedShares] = JSON.parse(data) as [
      string,
      ...string[],
    ];
    const decryptedShares = this.input.map((share) => {
      return share ? new Uint8Array(Buffer.from(share, "base64")) : null;
    });
    const sssSecret = await sss.combineShares(
      decryptedShares.filter((v): v is Uint8Array => !!v),
    );
    const raw = SHA256.hash(new Word32Array(sssSecret)).toUint8Array();
    const key = await window.crypto.subtle.importKey(
      "raw",
      raw,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"],
    );
    return new AesGcmDecryption(key).decrypt(encrypted);
  }
}
