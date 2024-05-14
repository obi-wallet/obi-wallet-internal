import { Base64EncodedString, Encoding } from "@obi-wallet/encoding";

export class AesGcmEncryption {
  public constructor(protected readonly key: CryptoKey) {}

  public async encrypt(data: string): Promise<Base64EncodedString> {
    const enc = new TextEncoder();
    const encoded = enc.encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      this.key,
      encoded,
    );
    const result = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
    return Encoding.fromBytes(result).toBase64();
  }
}

export class AesGcmDecryption {
  public constructor(protected readonly key: CryptoKey) {}

  public async decrypt(data: Base64EncodedString): Promise<string> {
    const rawData = Encoding.fromBase64(data).toBytes();
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
