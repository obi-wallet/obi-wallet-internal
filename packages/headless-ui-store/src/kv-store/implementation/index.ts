import { deserialize, serialize } from "@obi-wallet/sdk-json";
import { createInstance } from "localforage";
import * as R from "ramda";

import { AbstractKVStore } from "../abstract";

export class KVStore implements AbstractKVStore {
  protected readonly legacyDb: LocalForage;
  protected readonly db: LocalForage;

  public constructor(protected readonly _prefix: string) {
    this.legacyDb = createInstance({
      name: `kv-store/${_prefix}`,
      storeName: "entries",
    });
    this.db = createInstance({
      name: "ObiWallet",
      storeName: _prefix,
    });
  }

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    const entry = await this.db.getItem<Uint8Array>(key);

    if (entry) {
      return await this.decryptValue<T>(entry);
    }

    const legacyEntry = await this.legacyDb.getItem<
      | {
          key: string;
          value: string;
        }
      | {
          key: string;
          encrypted: Uint8Array;
        }
    >(key);

    if (!legacyEntry) {
      return undefined;
    }

    if (R.has("encrypted", legacyEntry)) {
      return await this.decryptValue<T>(legacyEntry.encrypted);
    } else {
      return deserialize(legacyEntry?.value);
    }
  }

  protected async decryptValue<T>(value: Uint8Array): Promise<T> {
    return deserialize(await decrypt(value));
  }

  public async set<T = unknown>(key: string, data: T | null) {
    // Passing `null` or `undefined` means we want to delete the existing data item.
    if (data === null || data === undefined) {
      await this.db.removeItem(key);
      return;
    } else {
      const encrypted = await encrypt(serialize(data));
      await this.db.setItem(key, encrypted);
    }
  }

  public prefix() {
    return this._prefix;
  }
}

class EncryptionKey {
  protected static singletonPromise: Promise<CryptoKey> | null = null;

  public static async get() {
    if (!EncryptionKey.singletonPromise) {
      EncryptionKey.singletonPromise = EncryptionKey.getOrCreateEncryptionKey();
    }
    return await EncryptionKey.singletonPromise;
  }

  protected static async getOrCreateEncryptionKey() {
    const db = createInstance({
      name: "ObiWallet",
      storeName: "encryption-key",
    });

    const entry = await db.getItem<CryptoKey>("key");
    if (entry) return entry;

    const legacyDb = createInstance({
      name: `kv-store/encryption-key`,
      storeName: "entries",
    });

    const legacyEntry = await legacyDb.getItem<{ value: CryptoKey }>("key");
    if (legacyEntry) {
      await db.setItem("key", legacyEntry.value);
      return legacyEntry.value;
    }

    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"],
    );
    await db.setItem("key", key);
    return key;
  }
}

async function encrypt(data: string) {
  const enc = new TextEncoder();
  const encoded = enc.encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    await EncryptionKey.get(),
    encoded,
  );
  return new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
}

async function decrypt(data: Uint8Array) {
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    await EncryptionKey.get(),
    encrypted,
  );
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
