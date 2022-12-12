import { App } from "@obi-wallet/common";
import {
  NavigationProp,
  ParamListBase,
  useNavigation as useNavigationOriginal,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeStackParamList } from "./screens/home/home-stack";
import { OnboardingStackParamList } from "./screens/onboarding/onboarding-stack";
import { SettingsStackParamList } from "./screens/settings/settings-stack";

export interface RootStackParamList
  extends ParamListBase,
    OnboardingStackParamList,
    SettingsStackParamList,
    HomeStackParamList {
  home: undefined;
  "web-view": {
    app: App;
  };
  send: undefined;
  receive: undefined;
  migrate: undefined;
}

export const RootStack = createNativeStackNavigator<RootStackParamList>();

export function useRootNavigation() {
  return useNavigationOriginal<NavigationProp<RootStackParamList>>();
}
