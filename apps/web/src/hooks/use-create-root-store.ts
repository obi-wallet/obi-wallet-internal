import { createRootStore, RootStore, rootStore } from "@/stores";
import { Config } from "@obi-wallet/config";
import { useEffect } from "react";

export function useCreateRootStore({ config }: { config: Config }): RootStore {
  useEffect(() => {
    rootStore.current?.configStore.setConfig(config);
  }, [config]);
  return createRootStore({ config });
}
