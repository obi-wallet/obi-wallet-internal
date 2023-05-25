import {
  CreateWalletScreen,
  DeviceKeyScreen,
  HomeScreen,
  KeyRoute,
  LookupProxyWalletsScreen,
  OnboardingRoute,
  PhoneKeyConfirmScreen,
  PhoneKeyRequestScreen,
  ReceiveScreen,
  RecoverWalletScreen,
  RootRoute,
  RootStack,
  SendScreen,
  settingsScreens,
  SocialKeyScreen,
  StakeScreen,
  useStore,
  WelcomeScreen,
} from "@obi-wallet/common";
import { WalletState } from "@obi-wallet/headless-ui";
import { observer } from "mobx-react-lite";

export const StateRenderer = observer(function StateRenderer() {
  const { walletsStore, walletsStoreState } = useStore();
  const navigationKey = walletsStore.currentWallet?.id ?? "onboarding";

  switch (walletsStoreState) {
    case WalletState.LOADING:
      // TODO:
      return null;
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
        <RootStack.Screen name={RootRoute.Send} component={SendScreen} />
        <RootStack.Screen name={RootRoute.Stake} component={StakeScreen} />
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

export const keyScreens = (navigationKey: string) => {
  return (
    <RootStack.Group navigationKey={navigationKey}>
      <RootStack.Screen
        name={KeyRoute.DeviceKey}
        key={KeyRoute.DeviceKey}
        component={DeviceKeyScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name={KeyRoute.PhoneKeyRequest}
        key={KeyRoute.PhoneKeyRequest}
        component={PhoneKeyRequestScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name={KeyRoute.PhoneKeyConfirm}
        key={KeyRoute.PhoneKeyConfirm}
        component={PhoneKeyConfirmScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name={KeyRoute.SocialKey}
        key={KeyRoute.SocialKey}
        component={SocialKeyScreen}
        options={{ headerShown: false }}
      />
      {/* TODO: */}
      {/*<RootStack.Screen*/}
      {/*  name={KeyRoute.NfcKey}*/}
      {/*  key={KeyRoute.NfcKey}*/}
      {/*  component={NfcKeyScreen}*/}
      {/*  options={{ headerShown: false }}*/}
      {/*/>*/}
      {/* TODO: */}
      {/*<RootStack.Screen*/}
      {/*  name={KeyRoute.CloudKey}*/}
      {/*  key={KeyRoute.CloudKey}*/}
      {/*  component={CloudKeyScreen}*/}
      {/*  options={{ headerShown: false }}*/}
      {/*/>*/}
      {/* TODO: */}
      {/*<RootStack.Screen*/}
      {/*  name={KeyRoute.EmailKey}*/}
      {/*  key={KeyRoute.EmailKey}*/}
      {/*  component={EmailKeyScreen}*/}
      {/*  options={{ headerShown: false }}*/}
      {/*/>*/}
    </RootStack.Group>
  );
};
