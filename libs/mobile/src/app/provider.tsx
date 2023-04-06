import { Theme, ThemeProvider } from "@emotion/react";
import { Brand, Config, messages } from "@obi-wallet/common";
import { queryClient } from "@obi-wallet/sdk";
import { loopTheme, obiTheme } from "@obi-wallet/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  QueryClientProvider,
  QueryClientProviderProps,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { observer } from "mobx-react-lite";
import { ComponentProps, ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StoreContext } from "./stores";
import { useCreateRootStore } from "../background/root-store";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const QueryClientProviderWithPersister = observer<QueryClientProviderProps>(
  function QueryClientProviderWithPersister({ children }) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        {children}
      </PersistQueryClientProvider>
    );
  }
);

export interface ProviderProps {
  children: ReactNode;
  config: Config;
  navigationContainerProps?: Omit<
    ComponentProps<typeof NavigationContainer>,
    "children"
  >;
  QueryClientProvider?: typeof QueryClientProvider;
}

export const Provider = observer<ProviderProps>(function Provider({
  children,
  config,
  navigationContainerProps,
  QueryClientProvider = QueryClientProviderWithPersister,
}) {
  const rootStore = useCreateRootStore({ config });
  const { languageStore, configStore } = rootStore;
  const { currentLanguage } = languageStore;

  return (
    <QueryClientProvider client={queryClient}>
      <StoreContext.Provider value={rootStore}>
        <IntlProvider
          defaultLocale="en"
          locale={currentLanguage}
          messages={messages[currentLanguage]}
          formats={{
            date: {
              en: {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                hour12: false,
                minute: "2-digit",
                timeZoneName: "short",
              },
              de: {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                hour12: false,
                minute: "2-digit",
                timeZoneName: "short",
              },
              es: {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                hour12: false,
                minute: "2-digit",
                timeZoneName: "short",
              },
            },
          }}
        >
          <SafeAreaProvider>
            <NavigationContainer {...navigationContainerProps}>
              <ThemeProvider theme={getTheme(configStore.brand)}>
                <StatusBar barStyle="light-content" />
                {children}
              </ThemeProvider>
            </NavigationContainer>
          </SafeAreaProvider>
        </IntlProvider>
      </StoreContext.Provider>
    </QueryClientProvider>
  );
});

export function getTheme(brand: Brand): Theme {
  switch (brand) {
    case Brand.Obi:
      return obiTheme;
    case Brand.Loop:
      return loopTheme;
  }
}
