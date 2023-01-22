import { Theme, ThemeProvider } from "@emotion/react";
import { Brand, Config, Feature, messages } from "@obi-wallet/common";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import {
  ComponentProps,
  ReactNode,
  StrictMode,
  useEffect,
  useMemo,
} from "react";
import { IntlProvider } from "react-intl";
import { StatusBar } from "react-native";
import { endConnection, initConnection } from "react-native-iap";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { createRootStore } from "../background/root-store";
import { StoreContext } from "./stores";

const queryClient = new QueryClient();

export interface ProviderProps {
  children: ReactNode;
  initialConfig: Config;
  navigationContainerProps?: Omit<
    ComponentProps<typeof NavigationContainer>,
    "children"
  >;
}

export const Provider = observer<ProviderProps>(
  ({ children, initialConfig, navigationContainerProps }) => {
    const rootStore = useMemo(() => {
      return createRootStore({ initialConfig });
    }, [initialConfig]);
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
      <StrictMode>
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
      </StrictMode>
    );
  }
);

export function getTheme(brand: Brand): Theme {
  switch (brand) {
    case Brand.Obi: {
      return {
        colors: {
          background: "#1a1a1a",
        },
        fonts: {
          bold: "poppins-bold",
          regular: "poppins-regular",
          light: "poppins-light",
        },
      };
    }
    case Brand.Loop: {
      return {
        colors: {
          background: "#090817",
        },
        fonts: {
          bold: "Inter-Bold",
          regular: "Inter-Regular",
          light: "Inter-Light",
        },
      };
    }
  }
}
