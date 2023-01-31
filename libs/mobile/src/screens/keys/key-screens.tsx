import { DeviceKeyScreen } from "./device";
import { KeyRoute } from "./key-stack";
import { PhoneKeyConfirmScreen, PhoneKeyRequestScreen } from "./phone";
import { RootStack } from "../../app/root-stack";

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
    </RootStack.Group>
  );
};
