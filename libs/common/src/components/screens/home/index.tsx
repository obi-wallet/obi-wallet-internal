import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import { RootRoute, RootStackParamList } from "../../../router";

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  RootRoute.Home
>;

export const HomeScreen = observer(function HomeScreen() {
  // TODO:
  return null;
});
