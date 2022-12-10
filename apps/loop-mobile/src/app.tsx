import { BaseApp } from "@obi-wallet/mobile";
import analytics from "@react-native-firebase/analytics";
import { NavigationContainerRef } from "@react-navigation/native";
import { useRef } from "react";

import { config } from "./config";

export function App() {
  const routeName = useRef<string>();
  const navigation =
    useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);

  return (
    <BaseApp
      initialConfig={config}
      providerProps={{
        navigationContainerProps: {
          ref: navigation,
          onReady: () => {
            routeName.current = navigation.current?.getCurrentRoute()?.name;
          },
          onStateChange: async () => {
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
          },
        },
      }}
    />
  );
}
