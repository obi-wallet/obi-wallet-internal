import AsyncStorage from "@react-native-async-storage/async-storage";

import { AbstractKVStore } from "../abstract";

export class KVStore implements AbstractKVStore {
  constructor(protected readonly _prefix: string) {}

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    const data = await AsyncStorage.getItem(this.getKey(key));
    return data === null ? undefined : JSON.parse(data);
  }

  public async set<T = unknown>(key: string, data: T | null) {
    // Passing `null` or `undefined` means we want to delete the existing data item.
    if (data === null || data === undefined) {
      return await AsyncStorage.removeItem(this.getKey(key));
    } else {
      return await AsyncStorage.setItem(this.getKey(key), JSON.stringify(data));
    }
  }

  public prefix() {
    return this._prefix;
  }

  protected getKey(key: string) {
    return this.prefix() + "/" + key;
  }
}
