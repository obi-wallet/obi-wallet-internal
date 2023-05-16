import { Theme, ThemeProvider } from "@emotion/react";
import { PortalProvider } from "@gorhom/portal";
import { Brand, Config, messages } from "@obi-wallet/common-deprecated";
import { Provider as SdkProvider } from "@obi-wallet/headless-ui";
import { loopTheme, obiTheme } from "@obi-wallet/theme";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { ComponentProps, ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StoreContext } from "./stores";
import { useCreateRootStore } from "../background/root-store";

export interface ProviderProps {
  children: ReactNode;
  config: Config;
  navigationContainerProps?: Omit<
    ComponentProps<typeof NavigationContainer>,
    "children"
  >;
  QueryClientProvider?: typeof QueryClientProvider;
  buster?: string;
}

export const Provider = observer<ProviderProps>(function Provider({
  children,
  config,
  navigationContainerProps,
  QueryClientProvider,
  buster,
}) {
  const rootStore = useCreateRootStore({ config });
  const { languageStore, configStore } = rootStore;
  const { currentLanguage } = languageStore;

  return (
    <SdkProvider
      rootStore={rootStore.sdkRootStore}
      QueryClientProvider={QueryClientProvider}
      buster={buster}
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
            <PortalProvider>
              <NavigationContainer {...navigationContainerProps}>
                <ThemeProvider theme={getTheme(configStore.brand)}>
                  <StatusBar barStyle="light-content" />
                  {children}
                </ThemeProvider>
              </NavigationContainer>
            </PortalProvider>
          </SafeAreaProvider>
        </IntlProvider>
      </StoreContext.Provider>
    </SdkProvider>
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
