"use client";

import { MultiThemeProvider } from "@/components/provider/multi-theme-provider";
import { StoreContext } from "@/contexts";
import { useCreateRootStore } from "@/hooks/use-create-root-store";
import { obiModalConfig } from "@obi-wallet/config";
import { Provider as SdkProvider } from "@obi-wallet/headless-ui";
import { QueryClientProvider } from "@tanstack/react-query";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { observer } from "mobx-react-lite";
import { ReactNode, useRef } from "react";

import { AlertProvider } from "./alert";

export interface ProviderProps {
  children: ReactNode;
  QueryClientProvider?: typeof QueryClientProvider;
}

const Provider = observer<ProviderProps>(function Provider({
  children,
  QueryClientProvider,
}) {
  const rootStore = useCreateRootStore({ config: obiModalConfig });
  const buster = useRef<string>();
  if (!buster.current) {
    buster.current =
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? new Date().toISOString();
  }

  return (
    <SdkProvider
      QueryClientProvider={QueryClientProvider}
      buster={buster.current}
    >
      <StoreContext.Provider value={rootStore}>
        <MultiThemeProvider>
          <AlertProvider>{children}</AlertProvider>
        </MultiThemeProvider>
      </StoreContext.Provider>
      <ReactQueryDevtools />
    </SdkProvider>
  );
});

// For some reason, dynamic imports don't work correctly with named exports.
// eslint-disable-next-line import/no-default-export
export default Provider;
