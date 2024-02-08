import { rootStore } from "@/hooks/use-create-root-store";
import { MultisigPublicKey } from "@obi-wallet/sdk";
import {
  Sec256k1PrivateKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { SHA256, Word32Array } from "jscrypto";
import * as sss from "sss-wasm";
import invariant from "tiny-invariant";

export abstract class Encryption {
  public abstract encrypt(data: string): Promise<string>;
}

export abstract class Decryption {
  public abstract decrypt(data: string): Promise<string>;
}

export class Secp256k1Encryption extends Encryption {
  public constructor(protected readonly publicKey: Secp256k1PublicKey) {
    super();
  }

  public async encrypt(data: string): Promise<string> {
    const u8Data = Buffer.from(data, "utf8");
    const ecies = await this.getEciesWasm();
    const encrypted = ecies.encrypt(
      Buffer.from(this.publicKey.value, "base64"),
      u8Data,
    );
    return Buffer.from(encrypted).toString("base64");
  }

  protected async getEciesWasm() {
    const stores = rootStore.current;
    invariant(stores, "RootStore not initialized");
    return await stores.wasmStore.getEciesWasm();
  }
}

export class Secp256k1Decryption extends Decryption {
  public constructor(protected readonly privateKey: Sec256k1PrivateKey) {
    super();
  }

  public async decrypt(data: string): Promise<string> {
    const u8Data = Buffer.from(data, "base64");
    const ecies = await this.getEciesWasm();
    const decrypted = ecies.decrypt(
      Buffer.from(this.privateKey, "base64"),
      u8Data,
    );
    return Buffer.from(decrypted).toString("utf8");
  }

  protected async getEciesWasm() {
    const stores = rootStore.current;
    invariant(stores, "RootStore not initialized");
    return await stores.wasmStore.getEciesWasm();
  }
}

export class MultisigKeyEncryption extends Encryption {
  public constructor(protected readonly multisigPublicKey: MultisigPublicKey) {
    super();
  }

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

export type MultisigKeyDecryptionInput = (Sec256k1PrivateKey | null)[];

export class MultisigKeyDecryption extends Decryption {
  public constructor(protected readonly input: MultisigKeyDecryptionInput) {
    super();
  }

  public async decrypt(data: string): Promise<string> {
    const [encrypted, ...encryptedShares] = JSON.parse(data) as [
      string,
      ...string[],
    ];
    invariant(encryptedShares.length === this.input.length);

    const decryptedShares = await Promise.all(
      encryptedShares.map(async (encryptedShare, index) => {
        const privateKey = this.input[index];
        if (!privateKey) return null;
        const decryption = new Secp256k1Decryption(privateKey);
        return new Uint8Array(
          Buffer.from(await decryption.decrypt(encryptedShare), "base64"),
        );
      }),
    );
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

export class AesGcmEncryption extends Encryption {
  public constructor(protected readonly key: CryptoKey) {
    super();
  }

  public async encrypt(data: string): Promise<string> {
    const enc = new TextEncoder();
    const encoded = enc.encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      this.key,
      encoded,
    );
    const result = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
    return Buffer.from(result).toString("base64");
  }
}

export class AesGcmDecryption extends Decryption {
  public constructor(protected readonly key: CryptoKey) {
    super();
  }

  public async decrypt(data: string): Promise<string> {
    const rawData = new Uint8Array(Buffer.from(data, "base64"));
    const iv = rawData.slice(0, 12);
    const encrypted = rawData.slice(12);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      this.key,
      encrypted,
    );
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  }
}
