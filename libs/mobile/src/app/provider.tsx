import { messages } from "@obi-wallet/common";
import { NavigationContainer } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { ComponentProps, ReactNode, StrictMode } from "react";
import { IntlProvider } from "react-intl";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { rootStore } from "../background/root-store";
import { StoreContext } from "./stores";

export interface ProviderProps {
  children: ReactNode;
  navigationContainerProps?: Omit<
    ComponentProps<typeof NavigationContainer>,
    "children"
  >;
}

export const Provider = observer<ProviderProps>(
  ({ children, navigationContainerProps }) => {
    const { languageStore } = rootStore;
    const { currentLanguage } = languageStore;

    return (
      <StrictMode>
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
                <StatusBar barStyle="light-content" />
                {children}
              </NavigationContainer>
            </SafeAreaProvider>
          </IntlProvider>
        </StoreContext.Provider>
      </StrictMode>
    );
  }
);
