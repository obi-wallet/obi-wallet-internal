import { AbstractStorage } from "./abstract";

export function createMigratableStorage<PreviousVersions, CurrentVersion>({
  storage,
  migrate,
}: {
  storage: AbstractStorage<PreviousVersions | CurrentVersion>;
  migrate: (data: PreviousVersions | CurrentVersion) => Promise<CurrentVersion>;
}): AbstractStorage<CurrentVersion> {
  return {
    async get() {
      const rawValue = await storage.get();
      if (!rawValue) {
        return undefined;
      }
      return await migrate(rawValue);
    },
    async set(value: CurrentVersion) {
      return await storage.set(value);
    },
    async remove() {
      return await storage.remove();
    },
  };
}
