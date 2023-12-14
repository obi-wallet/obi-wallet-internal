import { ParamListBase } from "@react-navigation/native";

export enum SettingsRoute {
  MultisigSettings = "MultisigSettings",
  MultisigHealthChecks = "MultisigHealthChecks",
}

export interface SettingsStackParamList extends ParamListBase {
  [SettingsRoute.MultisigHealthChecks]: undefined;
  [SettingsRoute.MultisigSettings]: undefined;
}
