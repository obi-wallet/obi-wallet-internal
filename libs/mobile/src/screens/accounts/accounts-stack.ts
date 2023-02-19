import { createNativeStackNavigator } from "@react-navigation/native-stack";

export enum AccountsRoute {
  Overview = "Overview",
}

export interface AccountsStackParamList
  extends Record<string, object | undefined> {
  [AccountsRoute.Overview]: undefined;
}

export const AccountsStack =
  createNativeStackNavigator<AccountsStackParamList>();
