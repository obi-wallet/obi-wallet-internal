import {
  createMigratableStorage,
  MockKVStore,
  storageFromKVStore,
} from "@obi-wallet/headless-ui-store";
import { beforeEach, describe, expect, test } from "vitest";

describe("migratable storage", () => {
  interface V0Data {
    foo: string;
  }

  interface V1Data {
    bar: string;
  }

  interface V2Data {
    baz: string;
  }

  type Previous = V0Data | V1Data;
  type Current = V2Data;

  async function v0ToV1(data: V0Data): Promise<V1Data> {
    return {
      bar: data.foo,
    };
  }

  async function v1ToV2(data: V1Data): Promise<V2Data> {
    return {
      baz: data.bar,
    };
  }

  async function migrate(data: Previous | Current): Promise<Current> {
    if ("foo" in data) {
      return await v1ToV2(await v0ToV1(data));
    }
    if ("bar" in data) {
      return await v1ToV2(data);
    }
    return data;
  }

  const store = new MockKVStore("migratable-storage");
  const storage = storageFromKVStore<Previous | Current>({
    store,
    key: "key",
  });
  const migratableStore = createMigratableStorage<Previous, Current>({
    storage,
    migrate,
  });

  beforeEach(() => {
    MockKVStore.reset();
  });

  test("initial get returns undefined", async () => {
    expect(await migratableStore.get()).toBeUndefined();
  });

  test("set only accepts current version", async () => {
    await migratableStore.set({ baz: "foo" });
    expect(await migratableStore.get()).toEqual({ baz: "foo" });
  });

  test("v0 data will be migrated to current version", async () => {
    await storage.set({ foo: "foo" });
    expect(await migratableStore.get()).toEqual({ baz: "foo" });
  });
});
