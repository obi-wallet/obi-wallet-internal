import { Home } from "@obi-wallet/common";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RootRoute, useRootNavigation } from "../../root-stack";
import { useStore } from "../../stores";
import AmazonIcon from "./assets/Amazon_icon.svg";
import OpenseaIcon from "./assets/OpenSea_icon.svg";
import UniSwapIcon from "./assets/Uniswap_Logo.svg";
import BuyCryptoIcon from "./assets/buy_crypto.svg";
import CosmicPartyIcon from "./assets/cosmic_party.svg";
import GetTicketsIcon from "./assets/get_tickets.svg";
import HistoryIcon from "./assets/history.svg";
import MyTicketsIcon from "./assets/my_tickets.svg";
import { useTheme } from "@emotion/react";

const icons = [
  BuyCryptoIcon,
  CosmicPartyIcon,
  GetTicketsIcon,
  MyTicketsIcon,
  HistoryIcon,
  UniSwapIcon,
  OpenseaIcon,
  AmazonIcon,
];

export function DappExplorer() {
  const rootStore = useStore();
  const navigation = useRootNavigation();
  const safeArea = useSafeAreaInsets();
  const theme = useTheme()

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <Home
        rootStore={rootStore}
        onAppPress={(app) => {
          navigation.navigate(RootRoute.WebView, {
            app,
          });
        }}
        icons={icons}
        marginBottom={safeArea.bottom}
      />
    </SafeAreaView>
  );
}
