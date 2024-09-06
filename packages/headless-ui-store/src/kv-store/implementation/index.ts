import { deserialize, serialize } from "@obi-wallet/sdk-json";
import Dexie, { Table } from "dexie";
import * as R from "ramda";

import { KVStore as LegacyKvStore } from "./async-storage";
import { AbstractKVStore } from "../abstract";

interface LegacyEntry {
  key: string;
  value: string;
}

interface EncryptedEntry {
  key: string;
  encrypted: Uint8Array;
}

type Entry = LegacyEntry | EncryptedEntry;

class KVDexie extends Dexie {
  public entries!: Table<Entry>;

  public constructor(prefix: string) {
    super(`kv-store/${prefix}`);
    this.version(1).stores({
      entries: "key",
    });
  }
}

export class KVStore implements AbstractKVStore {
  protected readonly db: KVDexie;
  protected legacy: LegacyKvStore;

  public constructor(protected readonly _prefix: string) {
    this.db = new KVDexie(_prefix);
    this.legacy = new LegacyKvStore(_prefix);
  }

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    const entry = await this.db.entries.get(key);

    if (!entry) {
      try {
        const legacyData = await this.legacy.get<T>(key);
        if (legacyData) {
          await this.set(key, legacyData);
          await this.legacy.set(key, null);
          return legacyData;
        }
      } catch {
        // Ignore errors
      }
      return undefined;
    }

    if (R.has("encrypted", entry)) {
      try {
        const decrypted = await decrypt(entry.encrypted);
        return deserialize(decrypted);
      } catch (e) {
        console.error(e);
        return undefined;
      }
    }

    return deserialize(entry.value);
  }

  public async set<T = unknown>(key: string, data: T | null) {
    // Passing `null` or `undefined` means we want to delete the existing data item.
    if (data === null || data === undefined) {
      await this.db.entries.delete(key);
      return;
    } else {
      const encrypted = await encrypt(serialize(data));
      await this.db.entries.put({
        key,
        encrypted,
      });
    }
  }

  public prefix() {
    return this._prefix;
  }
}

class EncryptionKeyDexie extends Dexie {
  public entries!: Table<{
    key: "key";
    value: CryptoKey;
  }>;

  public constructor() {
    super(`kv-store/encryption-key`);
    this.version(1).stores({
      entries: "key",
    });
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
    const db = new EncryptionKeyDexie();
    const entry = await db.entries.get("key");
    if (entry) return entry.value;

    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"],
    );
    await db.entries.put({
      key: "key",
      value: key,
    });
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
