import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ParamListBase } from "@react-navigation/native";

export enum HomeDrawerRoute {
  HomeDrawer = "HomeDrawer",
}

export interface HomeDrawerParamList extends ParamListBase {
  [HomeDrawerRoute.HomeDrawer]: undefined;
}

export const HomeDrawer = createDrawerNavigator<HomeDrawerParamList>();

export enum HomeBottomTabRoute {
  Accounts = "Accounts",
  Assets = "Assets",
  Apps = "Apps",
  Nfts = "Nfts",
  Trade = "Trade",
  Settings = "Settings",
}

export interface HomeBottomTabParamList extends ParamListBase {
  [HomeBottomTabRoute.Accounts]: undefined;
  [HomeBottomTabRoute.Assets]: undefined;
  [HomeBottomTabRoute.Apps]: undefined;
  [HomeBottomTabRoute.Nfts]: undefined;
  [HomeBottomTabRoute.Trade]: undefined;
  [HomeBottomTabRoute.Settings]: undefined;
}

export const HomeBottomTab = createBottomTabNavigator<HomeBottomTabParamList>();
