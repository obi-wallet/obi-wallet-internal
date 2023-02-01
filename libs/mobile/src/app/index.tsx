import { useTheme } from "@emotion/react";
import {
  Config,
  isMultisigDemoWallet,
  Text,
  WalletState,
} from "@obi-wallet/common";
import { useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import codePush from "react-native-code-push";

import { deploymentKey } from "./code-push";
import { Loader } from "./loader";
import { Modals } from "./modals";
import { Provider, ProviderProps } from "./provider";
import { RootRoute, RootStack, useRootNavigation } from "./root-stack";
import { HomeScreen } from "./screens/home";
import { Stake } from "./screens/home/components/stake";
import { MultisigBiometrics } from "./screens/onboarding/common/1-biometrics";
import { MultisigPhoneNumber } from "./screens/onboarding/common/2-phone-number";
import { MultisigPhoneNumberConfirm } from "./screens/onboarding/common/3-phone-number-confirm";
import { MultisigSocial } from "./screens/onboarding/common/4-social";
import { MultisigInit } from "./screens/onboarding/create-multisig-init";
import { LookupProxyWallets } from "./screens/onboarding/lookup-proxy-wallets";
import { OnboardingRoute } from "./screens/onboarding/onboarding-stack";
import { RecoverMultisig } from "./screens/onboarding/recover-multisig";
import { RecoverSinglesig } from "./screens/onboarding/recover-singlesig";
import { ReplaceMultisig } from "./screens/onboarding/replace-multisig-key";
import { ReceiveScreen } from "./screens/receive";
import { SendScreen } from "./screens/send";
import { settingsScreens } from "./screens/settings";
import { SplashScreen } from "./screens/splash";
import { WebViewScreen } from "./screens/web-view";
import { useStore } from "./stores";
import { CreateWalletScreen } from "../screens/create-wallet";
import { keyScreens } from "../screens/keys/key-screens";
import { WelcomeScreen } from "../screens/welcome";

export interface BaseAppProps {
  initialConfig: Config;
  providerProps?: Omit<ProviderProps, "children" | "config">;
}

export const BaseApp = observer(function BaseApp({
  initialConfig,
  providerProps,
}: BaseAppProps) {
  const [updating, setUpdating] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastUpdate = useRef(0);

  useEffect(() => {
    const listener = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background|unknown/) &&
          nextAppState === "active"
        ) {
          const timeSinceLastUpdate = new Date().getTime() - lastUpdate.current;
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
        }

        appState.current = nextAppState;
      }
    );
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <Provider {...providerProps} config={initialConfig}>
      {updating ? (
        <Load />
      ) : (
        <>
          <DemoModeHeader />
          <StateRenderer />
          <Modals />
        </>
      )}
    </Provider>
  );
});
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

  // TODO: this doesn't work like this anymore
  if (!isMultisigDemoWallet(walletsStore.currentWallet)) return null;

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
        >
          {getScreens()}
        </RootStack.Navigator>
      );
    }
  }

  function getScreens() {
    if (walletsStore.currentWallet?.isReady) {
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
          <RootStack.Screen
            name={RootRoute.Receive}
            component={ReceiveScreen}
          />
          {settingsScreens()}
          {keyScreens()}
        </RootStack.Group>
      );
    } else {
      return (
        <RootStack.Group
          screenOptions={{
            headerShown: false,
          }}
        >
          <RootStack.Screen
            name={OnboardingRoute.Welcome}
            component={WelcomeScreen}
          />
          <RootStack.Screen
            name={OnboardingRoute.CreateMultisigBiometrics}
            component={MultisigBiometrics}
          />
          <RootStack.Screen
            name={OnboardingRoute.CreateMultisigPhoneNumber}
            component={MultisigPhoneNumber}
          />
          <RootStack.Screen
            name={OnboardingRoute.CreateMultisigPhoneNumberConfirm}
            component={MultisigPhoneNumberConfirm}
          />
          <RootStack.Screen
            name={OnboardingRoute.CreateMultisigSocial}
            component={MultisigSocial}
          />
          <RootStack.Screen
            name={OnboardingRoute.CreateMultisigInit}
            component={MultisigInit}
          />
          <RootStack.Screen
            name={OnboardingRoute.ReplaceMultisig}
            component={ReplaceMultisig}
          />
          <RootStack.Screen
            name={OnboardingRoute.RecoverMultisig}
            component={RecoverMultisig}
          />
          <RootStack.Screen
            name={OnboardingRoute.RecoverSinglesig}
            component={RecoverSinglesig}
          />
          <RootStack.Screen
            name={OnboardingRoute.LookupProxyWallets}
            component={LookupProxyWallets}
          />
          <RootStack.Screen
            name={OnboardingRoute.CreateWallet}
            component={CreateWalletScreen}
          />
          {keyScreens()}
        </RootStack.Group>
      );
    }
  }
});
