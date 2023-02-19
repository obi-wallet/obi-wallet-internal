import { createNativeStackNavigator } from "@react-navigation/native-stack";

export enum AccountsRoute {
  Overview = "Overview",
  AddAccount = "AddAccount",
}

export interface AccountsStackParamList
  extends Record<string, object | undefined> {
  [AccountsRoute.Overview]: undefined;
  [AccountsRoute.AddAccount]: undefined;
}

export const AccountsStack =
  createNativeStackNavigator<AccountsStackParamList>();
