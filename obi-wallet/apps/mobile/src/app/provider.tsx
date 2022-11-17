import { messages } from "@obi-wallet/common";
import analytics from "@react-native-firebase/analytics";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { ReactNode, StrictMode, useRef } from "react";
import { IntlProvider } from "react-intl";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { rootStore } from "../background/root-store";
import { StoreContext } from "./stores";

export interface ProviderProps {
  children: ReactNode;
}

export const Provider = observer<ProviderProps>(({ children }) => {
  const routeName = useRef<string>();
  const navigation =
    useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);

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
            <NavigationContainer
              ref={navigation}
              onReady={() => {
                routeName.current = navigation.current?.getCurrentRoute()?.name;
              }}
              onStateChange={async () => {
                const previousRouteName = routeName.current;
                const currentRouteName =
                  navigation.current?.getCurrentRoute()?.name;

                if (previousRouteName !== currentRouteName) {
                  await analytics().logScreenView({
                    screen_name: currentRouteName,
                    screen_class: currentRouteName,
                  });
                }
                routeName.current = currentRouteName;
              }}
            >
              <StatusBar barStyle="light-content" />
              {children}
            </NavigationContainer>
          </SafeAreaProvider>
        </IntlProvider>
      </StoreContext.Provider>
    </StrictMode>
  );
});
