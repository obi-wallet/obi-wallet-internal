"use client";

import { MultiThemeProvider } from "@/components/provider/multi-theme-provider";
import { EnvContext, StoreContext } from "@/contexts";
import { useCreateRootStore } from "@/hooks/use-create-root-store";
import { obiModalConfig } from "@obi-wallet/config";
import { Provider as SdkProvider } from "@obi-wallet/headless-ui";
import { QueryClientProvider } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export interface ProviderProps {
  children: ReactNode;
  QueryClientProvider?: typeof QueryClientProvider;
  buster?: string;
}

const Provider = observer<ProviderProps>(function Provider({
  children,
  QueryClientProvider,
  buster,
}) {
  const rootStore = useCreateRootStore({ config: obiModalConfig });

  return (
    <SdkProvider QueryClientProvider={QueryClientProvider} buster={buster}>
      <EnvContext.Provider
        value={{
          FAST_TRAVEL_API_URL: process.env.NEXT_PUBLIC_FAST_TRAVEL_API_URL!,
          PHONE_NUMBER_KEY_SECRET:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_KEY_SECRET!,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_USER:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_USER!,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD!,
          THEME: process.env.NEXT_PUBLIC_THEME!,
        }}
      >
        <StoreContext.Provider value={rootStore}>
          <MultiThemeProvider>{children}</MultiThemeProvider>
        </StoreContext.Provider>
      </EnvContext.Provider>
    </SdkProvider>
  );
});

// For some reason, dynamic imports don't work correctly with named exports.
// eslint-disable-next-line import/no-default-export
export default Provider;
