import { ParamListBase } from "@react-navigation/native";

export enum SettingsRoute {
  MultisigSettings = "MultisigSettings",
  MultisigHealthChecks = "MultisigHealthChecks",
  OsmosisSettings = "OsmosisSettings",
  WhitelistedLPs = "WhitelistedLPs",
}

export interface SettingsStackParamList extends ParamListBase {
  [SettingsRoute.MultisigHealthChecks]: undefined;
  [SettingsRoute.MultisigSettings]: undefined;
  [SettingsRoute.OsmosisSettings]: undefined;
  [SettingsRoute.WhitelistedLPs]: undefined;
}
