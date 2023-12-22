import * as crypto from "crypto";
import { createCipheriv, pbkdf2Sync, randomBytes } from "crypto";

export class BrowserKeyEncryptor {
  readonly #iv: Uint8Array;
  algorithm: "aes-256-gcm";
  constructor() {
    this.algorithm = "aes-256-gcm";
    this.#iv = window.crypto.getRandomValues(new Uint8Array(16));
    // this.#salt = window.crypto.getRandomValues(new Uint8Array(64));
  }

  async getKeyMaterial(data: string) {
    const encodedData = BrowserKeyEncryptor.#encodeData(data);
    return window.crypto.subtle.importKey(
      "raw",
      encodedData,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    );
  }

  async getKey(keyMaterial: CryptoKey, salt: Uint8Array) {
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 9999,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  }
  async encrypt(key: CryptoKey, data: string) {
    const encodedData = BrowserKeyEncryptor.#encodeData(data);
    return window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: this.#iv!,
      },
      key, // getKey(keyMaterial, salt)
      encodedData,
    );
  }
  async decrypt(key: CryptoKey, cipherText: ArrayBuffer) {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: this.#iv,
      },
      key,
      cipherText,
    );
    return BrowserKeyEncryptor.#decodeData(decrypted);
  }
  static #encodeData(input: string) {
    const encoder = new TextEncoder();
    return encoder.encode(input);
  }
  static #decodeData(cipherText: ArrayBuffer) {
    const decoder = new TextDecoder();
    return decoder.decode(cipherText);
  }
  async generateAes256GcmKey(extractable: boolean = false) {
    return window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      extractable,
      ["encrypt", "decrypt"],
    );
  }
  async exportKey(key: CryptoKey) {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return new Uint8Array(exported);
  }
}

export class ServerKeyEncryptor {
  algorithm: "aes-256-gcm";
  constructor() {
    this.algorithm = "aes-256-gcm";
  }
  // Lets Obi's Key B is used here to encrypt User's Secp256k1 encrypted by Key A
  encrypt(data: string, masterKey: Uint8Array) {
    const iv = randomBytes(16);
    const salt = randomBytes(64);
    const key = pbkdf2Sync(masterKey, salt, 2256, 32, "sha512");
    // AES 256 GCM Mode
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(data, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
  }
  decrypt(encrypted: string, masterKey: Uint8Array) {
    const encryptedBuf = Buffer.from(encrypted, "base64");
    const salt = encryptedBuf.subarray(0, 64);
    const iv = encryptedBuf.subarray(64, 80);
    const tag = encryptedBuf.subarray(80, 96);
    const data = encryptedBuf.subarray(96);

    const key = crypto.pbkdf2Sync(masterKey, salt, 2256, 32, "sha512");
    // AES 256 GCM Mode
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(data, undefined, "utf-8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
  convertKeyToBase64(buffer: Uint8Array) {
    return Buffer.from(buffer).toString("base64");
  }
  convertKeyToBuffer(base64Seed: string) {
    const base64SeedBuf = Buffer.from(base64Seed, "base64");
    return new Uint8Array(
      base64SeedBuf.buffer.slice(
        base64SeedBuf.byteOffset,
        base64SeedBuf.byteOffset + base64SeedBuf.byteLength,
      ),
    );
  }
}

export const encryptWithPubKey = async (pubKeyPem: string, sk: Uint8Array) => {
  const pubKeyBinary = atob(pubKeyPem);
  const pubKeyBuf = new Uint8Array(pubKeyBinary.length);

  for (let i = 0; i < pubKeyBinary.length; i++) {
    pubKeyBuf[i] = pubKeyBinary.charCodeAt(i);
  }

  const importedKey = await crypto.subtle.importKey(
    "spki",
    pubKeyBuf.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );
  console.log("key imported");
  return crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    importedKey,
    sk,
  );
};

export const decryptWithPrivateKey = (
  privateKeyPem: string,
  encryptedData: Buffer,
) => {
  const decryptedBuffer = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    encryptedData,
  );
  return decryptedBuffer.toString("utf8");
};
