import { App } from "@obi-wallet/common";
import {
  NavigationProp,
  ParamListBase,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingStackParamList } from "./screens/onboarding/onboarding-stack";
import { SettingsStackParamList } from "./screens/settings/settings-stack";

export enum RootRoute {
  Home = "Home",
  WebView = "WebView",
  Send = "Send",
  Receive = "Receive",
}

export interface RootStackParamList
  extends ParamListBase,
    OnboardingStackParamList,
    SettingsStackParamList {
  [RootRoute.Home]: undefined;
  [RootRoute.WebView]: {
    app: App;
  };
  [RootRoute.Send]: undefined;
  [RootRoute.Receive]: undefined;
}

export const RootStack = createNativeStackNavigator<RootStackParamList>();

export function useRootNavigation() {
  return useNavigationOriginal<NavigationProp<RootStackParamList>>();
}
