import { RootStore } from "@/stores";
import { Config } from "@obi-wallet/config";
import { useEffect } from "react";

export const rootStore: { current: RootStore | null } = { current: null };

export function useCreateRootStore({ config }: { config: Config }): RootStore {
  useEffect(() => {
    rootStore.current?.configStore.setConfig(config);
  }, [config]);

  if (!rootStore.current) {
    rootStore.current = new RootStore({
      deviceLanguage: "en",
      initialConfig: config,
    });
  }

  return rootStore.current;
}
