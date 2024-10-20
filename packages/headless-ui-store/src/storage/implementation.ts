import { AbstractStorage } from "./abstract";
import { AbstractKVStore, KVStore } from "../kv-store";

export function storageFromKVStore<T>({
  store,
  key,
}: {
  store: AbstractKVStore;
  key: string;
}): AbstractStorage<T> {
  return {
    async get() {
      return await store.get<T>(key);
    },
    async set(value) {
      return await store.set<T>(key, value);
    },
    async remove() {
      return await store.set<T>(key, null);
    },
  };
}

export function defaultStorage<T>({
  prefix,
  key,
}: {
  prefix: string;
  key: string;
}): AbstractStorage<T> {
  return storageFromKVStore({
    store: new KVStore(prefix),
    key,
  });
}
