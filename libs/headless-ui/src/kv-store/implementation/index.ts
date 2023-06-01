import Dexie, { Table } from "dexie";

import { KVStore as LegacyKvStore } from "./async-storage";
import { AbstractKVStore } from "../abstract";

interface Entry {
  key: string;
  value: string;
}

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
      } catch (_e) {
        // Ignore errors
      }
      return undefined;
    }
    return JSON.parse(entry.value);
  }

  public async set<T = unknown>(key: string, data: T | null) {
    // Passing `null` or `undefined` means we want to delete the existing data item.
    if (data === null || data === undefined) {
      await this.db.entries.delete(key);
    } else {
      await this.db.entries.put({
        key,
        value: JSON.stringify(data),
      });
    }
  }

  public prefix() {
    return this._prefix;
  }
}
