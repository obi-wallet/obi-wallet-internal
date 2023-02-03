import { ParamListBase } from "@react-navigation/native";

export enum SettingsRoute {
  AddSubAccount = "AddSubAccount",
  MultisigSettings = "MultisigSettings",
  MultisigHealthChecks = "MultisigHealthChecks",
}

export interface SettingsStackParamList extends ParamListBase {
  [SettingsRoute.AddSubAccount]: undefined;
  [SettingsRoute.MultisigHealthChecks]: undefined;
  [SettingsRoute.MultisigSettings]: undefined;
}
