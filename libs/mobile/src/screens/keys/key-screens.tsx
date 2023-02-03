import { RootStack } from "../../app/root-stack";
import { DeviceKeyScreen } from "./device";
import { EmailKeyScreen } from "./email";
import { KeyRoute } from "./key-stack";
import { PhoneKeyConfirmScreen, PhoneKeyRequestScreen } from "./phone";
import { SocialKeyScreen } from "./social";

export const keyScreens = () => {
  return (
    <RootStack.Group>
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
        name={KeyRoute.EmailKey}
        key={KeyRoute.EmailKey}
        component={EmailKeyScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Group>
  );
};
