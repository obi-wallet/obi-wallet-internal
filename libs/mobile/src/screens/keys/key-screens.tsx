import { DeviceKeyScreen, KeyRoute, RootStack } from "@obi-wallet/common";

import { CloudKeyScreen } from "./cloud";
import { EmailKeyScreen } from "./email";
import { NfcKeyScreen } from "./nfc";
import { PhoneKeyConfirmScreen, PhoneKeyRequestScreen } from "./phone";
import { SocialKeyScreen } from "./social";

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
      <RootStack.Screen
        name={KeyRoute.NfcKey}
        key={KeyRoute.NfcKey}
        component={NfcKeyScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name={KeyRoute.CloudKey}
        key={KeyRoute.CloudKey}
        component={CloudKeyScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name={KeyRoute.EmailKey}
        key={KeyRoute.EmailKey}
        component={EmailKeyScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Group>
  );
};
