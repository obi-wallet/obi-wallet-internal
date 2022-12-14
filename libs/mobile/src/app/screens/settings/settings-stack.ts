import { ParamListBase } from "@react-navigation/native";

export enum SettingsRoute {
  AddSubAccount = "AddSubAccount",
  MultisigSettings = "MultisigSettings",
  MultisigHealthChecks = "MultisigHealthChecks",
  SinglesigSeedphrase = "SinglesigSeedphrase",
}

export interface SettingsStackParamList extends ParamListBase {
  [SettingsRoute.AddSubAccount]: undefined;
  [SettingsRoute.MultisigHealthChecks]: undefined;
  [SettingsRoute.MultisigSettings]: undefined;
  [SettingsRoute.SinglesigSeedphrase]: undefined;
}
