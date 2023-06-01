import { useTheme } from "@emotion/react";
import { Feature } from "@obi-wallet/config";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { Sdk } from "@obi-wallet/sdk";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import {
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../contexts";
import { RootStackParamList } from "../../router";
import { Avatar } from "../avatar";
import { ObiIcon } from "../icons";
import { Text } from "../typography";

export interface NetworkAccountPickerLayoutProps {
  children: ReactNode;
}

export const NetworkAccountPickerLayout =
  observer<NetworkAccountPickerLayoutProps>(
    function NetworkAccountPickerLayout({ children }) {
      const { chainStore } = useStore();
      const currentNetwork = chainStore.currentChainInformation.label;

      return (
        <SafeAreaView
          style={{
            flex: 1,
            flexGrow: 1,
          }}
          edges={["top", "left", "right"]}
        >
          <Header currentNetwork={currentNetwork} />
          {children}
        </SafeAreaView>
      );
    }
  );

export const Header = observer<{ currentNetwork: string }>(function Header({
  currentNetwork,
}) {
  const navigation = useNavigation<
    DrawerNavigationProp<Record<string, object>> &
      NavigationProp<RootStackParamList>
  >();
  const { configStore } = useStore();
  const wallet = useCurrentWallet();
  const theme = useTheme();
  if (Platform.OS === "web") {
    return null;
  }

  return (
    <View
      style={{
        padding: 16,
        flexDirection: "row",
        justifyContent: "flex-end",
      }}
    >
      {/* <View
        style={{
          backgroundColor: isObi ? "#272727" : "#16152D",
          alignSelf: "flex-start",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          minWidth: 100,
          paddingHorizontal: 13,
          paddingVertical: 10,
          borderRadius: 8,
        }}
        // onPress={() => navigation.openDrawer()}
      >
        <>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              ...(isObi
                ? {
                    padding: 5,
                    borderWidth: 1,
                    borderColor: "white",
                    borderRadius: 5,
                  }
                : {}),
            }}
          >
            <FontAwesomeIcon
              icon={isObi ? faRss : faAngleDoubleLeft}
              style={{ color: isObi ? "white" : "#7B87A8" }}
            />
          </View>
          <View
            style={{
              paddingLeft: 10,
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                color: "rgba(246, 245, 255, 0.6)",
                fontSize: 9,
                fontWeight: "500",
              }}
            >
              <FormattedMessage id="assets.network" defaultMessage="Network" />
            </Text>
            <Text style={{ color: "#F6F5FF", fontSize: 14 }}>
              {isSmallScreenSubstr(currentNetwork, "...", 15, 16)}
            </Text>
          </View>
        </>
      </View> */}

      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.panelBackground,
          paddingRight: 10,
          borderRadius: 8,
        }}
        onPress={() => {
          if (configStore.isFeatureEnabled(Feature.AccountsTab)) {
            // navigation.navigate(HomeBottomTabRoute.Accounts);
          }
        }}
      >
        <View style={{ margin: 10 }}>
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: 12,
              fontWeight: "600",
              textAlign: "right",
            }}
          >
            <FormattedMessage
              id="assets.walletname"
              defaultMessage="Wallet Name"
            />
          </Text>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 14,
              fontWeight: "500",
              textAlign: "right",
            }}
          >
            {getCurrentAccountName()}
          </Text>
        </View>
        {getCurrentAccountAvatar()}
      </TouchableOpacity>
    </View>
  );

  function getCurrentAccountName() {
    const account = wallet.currentAccount;
    return "Osmosis Smart Account";
    // if (account && account.type === "flex-account") {
    //   return account.meta.name || "Flex Account";
    // } else if (account && account.type === "singlesig-wallet") {
    //   return Bech32Address.shortenAddress(
    //     Sdk.chainId(wallet.chainId).transactions.getAddressOfPublicKey(
    //       account.publicKey
    //     ),
    //     20
    //   );
    // } else {
    //   return (
    //     <FormattedMessage
    //       id="accountscreen.accountname"
    //       defaultMessage="Obi Smart Account"
    //     />
    //   );
    // }
  }

  function getCurrentAccountAvatar() {
    const account = wallet.currentAccount;

    if (account) {
      return (
        <Avatar
          style={{
            width: 35,
            height: 35,
          }}
          account={account}
        />
      );
    } else {
      return (
        <ObiIcon
          style={{
            width: 35,
            height: 35,
          }}
        />
      );
    }
  }
});
