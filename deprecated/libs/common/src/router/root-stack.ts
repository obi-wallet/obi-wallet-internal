import {
  NavigationProp,
  ParamListBase,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { KeyStackParamList } from "./key-stack";
import { OnboardingStackParamList } from "./onboarding-stack";
import { SettingsStackParamList } from "./settings-stack";
import { EnrichedToken } from "../hooks";
import { App } from "../stores";

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
