import { Theme, ThemeProvider } from "@emotion/react";
import { Brand, Config, Feature, messages } from "@obi-wallet/common";
import { loopTheme, obiTheme } from "@obi-wallet/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { observer } from "mobx-react-lite";
import { ComponentProps, ReactNode, useEffect } from "react";
import { IntlProvider } from "react-intl";
import { StatusBar } from "react-native";
import { endConnection, initConnection } from "react-native-iap";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StoreContext } from "./stores";
import { useCreateRootStore } from "../background/root-store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 1 day
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export interface ProviderProps {
  children: ReactNode;
  config: Config;
  navigationContainerProps?: Omit<
    ComponentProps<typeof NavigationContainer>,
    "children"
  >;
}

export const Provider = observer<ProviderProps>(function Provider({
  children,
  config,
  navigationContainerProps,
}) {
  const rootStore = useCreateRootStore({ config });
  const { languageStore, configStore } = rootStore;
  const { currentLanguage } = languageStore;

  useEffect(() => {
    if (!configStore.isFeatureEnabled(Feature.InAppPurchases)) return;
    void initConnection();
    return () => {
      void endConnection();
    };
  }, [configStore]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
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
    </PersistQueryClientProvider>
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
