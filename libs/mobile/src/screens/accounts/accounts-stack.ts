import { createNativeStackNavigator } from "@react-navigation/native-stack";

export enum AccountsRoute {
  AccountsOverview = "AccountsOverview",
  AddAccount = "AddAccount",
  CreateFlexAccount = "CreateFlexAccount",
}

export interface AccountsStackParamList
  extends Record<string, object | undefined> {
  [AccountsRoute.AccountsOverview]: undefined;
  [AccountsRoute.AddAccount]: undefined;
  [AccountsRoute.CreateFlexAccount]: undefined;
}

export const AccountsStack =
  createNativeStackNavigator<AccountsStackParamList>();
