import {
  App,
  KeyStackParamList,
  OnboardingStackParamList,
} from "@obi-wallet/common";
import {
  NavigationProp,
  ParamListBase,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { EnrichedToken } from "./balances";
import { SettingsStackParamList } from "./screens/settings/settings-stack";

export enum RootRoute {
  Home = "Home",
  WebView = "WebView",
  Send = "Send",
  Receive = "Receive",
  Stake = "Stake",
}

export interface RootStackParamList
  extends ParamListBase,
    OnboardingStackParamList,
    KeyStackParamList,
    SettingsStackParamList {
  [RootRoute.Home]: undefined;
  [RootRoute.WebView]: {
    app: App;
  };
  [RootRoute.Send]: {
    asset?: EnrichedToken;
  };
  [RootRoute.Receive]: undefined;
  [RootRoute.Stake]: undefined;
}

export const RootStack = createNativeStackNavigator<RootStackParamList>();

export function useRootNavigation() {
  return useNavigationOriginal<NavigationProp<RootStackParamList>>();
}
