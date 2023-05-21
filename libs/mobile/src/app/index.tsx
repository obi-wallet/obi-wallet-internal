import { useTheme } from "@emotion/react";
import { PortalHost } from "@gorhom/portal";
import {
  CreateWalletScreen,
  Loader,
  OnboardingRoute,
  RootRoute,
  RootStack,
  Text,
  useStore,
  WelcomeScreen,
} from "@obi-wallet/common";
import { Config } from "@obi-wallet/config";
import {
  useCodePushBackgroundUpdate,
  WalletState,
} from "@obi-wallet/headless-ui";
import { observer } from "mobx-react-lite";
import { Platform, UIManager, View } from "react-native";
import KeyboardManager from "react-native-keyboard-manager";
import { FullWindowOverlay } from "react-native-screens";

import { deploymentKey } from "./code-push";
import { Modals } from "./modals";
import { Provider, ProviderProps } from "./provider";
import { HomeScreen } from "./screens/home";
import { Stake } from "./screens/home/components/stake";
import { ReceiveScreen } from "./screens/receive";
import { SendScreen } from "./screens/send";
import { settingsScreens } from "./screens/settings";
import { SplashScreen } from "./screens/splash";
import { WebViewScreen } from "./screens/web-view";
import { keyScreens } from "../screens/keys/key-screens";
import { LookupProxyWalletsScreen } from "../screens/lookup-proxy-wallets";
import { RecoverWalletScreen } from "../screens/recover-wallet";

if (Platform.OS === "ios") {
  KeyboardManager?.setToolbarPreviousNextButtonEnable(true);
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface BaseAppProps {
  initialConfig: Config;
  providerProps?: Omit<ProviderProps, "children" | "config">;
}

export const BaseApp = observer<BaseAppProps>(function BaseApp({
  initialConfig,
  providerProps,
}) {
  return (
    <Provider {...providerProps} config={initialConfig}>
      <BaseAppWithoutProvider />
    </Provider>
  );
});

export const BaseAppWithoutProvider = observer(
  function BaseAppWithoutProvider() {
    const updating = useCodePushBackgroundUpdate({ deploymentKey });
    if (updating) return <Load />;

    return (
      <>
        <DemoModeHeader />
        <StateRenderer />
        <Modals />
        <FullWindowOverlay>
          <PortalHost name="bottom-sheet" />
        </FullWindowOverlay>
      </>
    );
  }
);

const Load = observer(function Load() {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
    >
      <Loader
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          marginBottom: 150,
        }}
        loadingText="Updating app bundle"
        animation={require("./loader/broadcast.json")}
        animationStyles={{
          width: 300,
          height: 300,
          maxHeight: "100%",
          maxWidth: "100%",
        }}
      />
    </View>
  );
});

export const DemoModeHeader = observer(function DemoModeHeader() {
  // TODO: fix
  return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 20,
        left: "40%",
        right: "40%",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <Text
        style={{
          color: "#fff",
        }}
      >
        Demo
      </Text>
    </View>
  );
});

export const StateRenderer = observer(function StateRenderer() {
  const { walletsStore, walletsStoreState } = useStore();
  const navigationKey = walletsStore.currentWallet?.id ?? "onboarding";

  switch (walletsStoreState) {
    case WalletState.LOADING:
      return <SplashScreen />;
    case WalletState.INVALID:
      // TODO: Here we want to show some kind of error screen.
      return null;
    case WalletState.READY: {
      return (
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            headerTitleStyle: {
              fontFamily: "Inter",
            },
          }}
        >
          {walletsStore.currentWallet
            ? getAuthenticatedScreens()
            : getOnboardingScreens()}
          {getSharedScreens()}
        </RootStack.Navigator>
      );
    }
  }

  function getOnboardingScreens() {
    return (
      <RootStack.Group>
        <RootStack.Screen
          name={OnboardingRoute.Welcome}
          component={WelcomeScreen}
        />
        <RootStack.Screen
          name={OnboardingRoute.LookupProxyWallets}
          component={LookupProxyWalletsScreen}
        />
        <RootStack.Screen
          name={OnboardingRoute.CreateWallet}
          component={CreateWalletScreen}
        />
        <RootStack.Screen
          name={OnboardingRoute.RecoverWallet}
          component={RecoverWalletScreen}
        />
      </RootStack.Group>
    );
  }

  function getAuthenticatedScreens() {
    return (
      <RootStack.Group>
        <RootStack.Screen name={RootRoute.Home} component={HomeScreen} />
        <RootStack.Screen
          name={RootRoute.WebView}
          component={WebViewScreen}
          options={({ route }) => ({
            title: route.params.app.label,
          })}
        />
        <RootStack.Screen name={RootRoute.Send} component={SendScreen} />
        <RootStack.Screen name={RootRoute.Stake} component={Stake} />
        <RootStack.Screen name={RootRoute.Receive} component={ReceiveScreen} />
        {settingsScreens()}
      </RootStack.Group>
    );
  }

  function getSharedScreens() {
    return (
      <RootStack.Group navigationKey={navigationKey}>
        {keyScreens(navigationKey)}
      </RootStack.Group>
    );
  }
});
