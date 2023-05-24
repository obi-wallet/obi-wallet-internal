import { createNativeStackNavigator } from "@react-navigation/native-stack";

export enum AccountsRoute {
  AccountsOverview = "AccountsOverview",
  AddAccount = "AddAccount",
  CreateFlexAccount = "CreateFlexAccount",
  CreateBeneficiaryAccount = "CreateBeneficiaryAccount",
  ImportLegacyAccount = "ImportLegacyAccount",
  ImportBipMnemonic = "ImportBipMnemonic",
}

export interface AccountsStackParamList
  extends Record<string, object | undefined> {
  [AccountsRoute.AccountsOverview]: undefined;
  [AccountsRoute.AddAccount]: undefined;
  [AccountsRoute.CreateFlexAccount]: undefined;
  [AccountsRoute.CreateBeneficiaryAccount]: undefined;
  [AccountsRoute.ImportLegacyAccount]: undefined;
  [AccountsRoute.ImportBipMnemonic]: {
    path: string;
  };
}

export const AccountsStack =
  createNativeStackNavigator<AccountsStackParamList>();
