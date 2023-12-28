"use client";

import { Env, EnvContext, StoreContext } from "@/contexts";
import { useCreateRootStore } from "@/hooks/use-create-root-store";
import { Config } from "@obi-wallet/config";
import { Provider as SdkProvider } from "@obi-wallet/headless-ui";
import { QueryClientProvider } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export interface ProviderProps {
  children: ReactNode;
  env: Env;
  config: Config;
  QueryClientProvider?: typeof QueryClientProvider;
  buster?: string;
}

export const Provider = observer<ProviderProps>(function Provider({
  children,
  config,
  env,
  QueryClientProvider,
  buster,
}) {
  const rootStore = useCreateRootStore({ config });

  return (
    <SdkProvider
      rootStore={rootStore.sdkRootStore}
      QueryClientProvider={QueryClientProvider}
      buster={buster}
    >
      <EnvContext.Provider value={env}>
        <StoreContext.Provider value={rootStore}>
          {children}
        </StoreContext.Provider>
      </EnvContext.Provider>
    </SdkProvider>
  );
});
