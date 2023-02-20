import { createNativeStackNavigator } from "@react-navigation/native-stack";

export enum AccountsRoute {
  AccountsOverview = "AccountsOverview",
  AddAccount = "AddAccount",
  CreateFlexAccount = "CreateFlexAccount",
  CreateBeneficiaryAccount = "CreateBeneficiaryAccount",
  ImportLegacyAccount = "ImportLegacyAccount",
  ImportStationAccount = "ImportStationAccount",
  ImportKeplrAccount = "ImportKeplrAccount",
}

export interface AccountsStackParamList
  extends Record<string, object | undefined> {
  [AccountsRoute.AccountsOverview]: undefined;
  [AccountsRoute.AddAccount]: undefined;
  [AccountsRoute.CreateFlexAccount]: undefined;
  [AccountsRoute.CreateBeneficiaryAccount]: undefined;
  [AccountsRoute.ImportLegacyAccount]: undefined;
  [AccountsRoute.ImportStationAccount]: undefined;
  [AccountsRoute.ImportKeplrAccount]: undefined;
}

export const AccountsStack =
  createNativeStackNavigator<AccountsStackParamList>();
