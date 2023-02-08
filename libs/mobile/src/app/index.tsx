import { useTheme } from "@emotion/react";
import { Config, Text, WalletState } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import codePush from "react-native-code-push";

import { deploymentKey } from "./code-push";
import { Loader } from "./loader";
import { Modals } from "./modals";
import { Provider, ProviderProps } from "./provider";
import { RootRoute, RootStack } from "./root-stack";
import { HomeScreen } from "./screens/home";
import { Stake } from "./screens/home/components/stake";
import { OnboardingRoute } from "./screens/onboarding/onboarding-stack";
import { ReceiveScreen } from "./screens/receive";
import { SendScreen } from "./screens/send";
import { settingsScreens } from "./screens/settings";
import { SplashScreen } from "./screens/splash";
import { WebViewScreen } from "./screens/web-view";
import { useStore } from "./stores";
import { CreateWalletScreen } from "../screens/create-wallet";
import { keyScreens } from "../screens/keys/key-screens";
import { LookupProxyWalletsScreen } from "../screens/lookup-proxy-wallets";
import { RecoverWalletScreen } from "../screens/recover-wallet";
import { WelcomeScreen } from "../screens/welcome";

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
    const [updating, setUpdating] = useState(false);
    const { walletConnectStore } = useStore();
    const appState = useRef(AppState.currentState);
    const lastUpdate = useRef(0);

    useEffect(() => {
      const listener = AppState.addEventListener(
        "change",
        async (nextAppState) => {
          const previousAppState = appState.current;
          appState.current = nextAppState;

          if (
            previousAppState.match(/inactive|background|unknown/) &&
            nextAppState === "active"
          ) {
            await Promise.all([
              walletConnectStore.recoverConnectors(),
              (async () => {
                const timeSinceLastUpdate =
                  new Date().getTime() - lastUpdate.current;
                if (timeSinceLastUpdate > 5 * 1000 && !__DEV__) {
                  if (await codePush.checkForUpdate(deploymentKey)) {
                    try {
                      await setUpdating(true);
                      await codePush.sync({
                        deploymentKey,
                        installMode: codePush.InstallMode.IMMEDIATE,
                      });
                    } catch (e) {
                      console.error(e);
                      await setUpdating(false);
                    }
                  }
                }

                lastUpdate.current = new Date().getTime();
              })(),
            ]);
          }
        }
      );
      return () => {
        listener.remove();
      };
    }, [walletConnectStore]);

    if (updating) return <Load />;

    return (
      <>
        <DemoModeHeader />
        <StateRenderer />
        <Modals />
      </>
    );
  }
);

const Load = observer(function Load() {
  const theme = useTheme();
  return (
    <Loader
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        position: "absolute",
        backgroundColor: theme.colors.background,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
  );
});

export const DemoModeHeader = observer(function DemoModeHeader() {
  const { walletsStore } = useStore();

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
  const { walletsStore } = useStore();

  switch (walletsStore.state) {
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
          initialRouteName={
            walletsStore.currentWallet
              ? RootRoute.Home
              : OnboardingRoute.Welcome
          }
        >
          {getScreens()}
        </RootStack.Navigator>
      );
    }
  }

  function getScreens() {
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
        {settingsScreens()}
        {keyScreens()}
      </RootStack.Group>
    );
  }
});
