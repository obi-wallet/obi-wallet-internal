import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons/faAngleDoubleLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import {
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../stores";
import ObiLogo from "../../settings/assets/obi-logo.svg";
import { isSmallScreenNumber, isSmallScreenSubstr } from "../screen-size";

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
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, object>>>();
  const { configStore } = useStore();
  const walletName = "My Obi Wallet";

  return (
    <View
      style={{
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <TouchableHighlight
        style={{
          backgroundColor: "#16152D",
          alignSelf: "flex-start",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          minWidth: 100,
          paddingHorizontal: 13,
          paddingVertical: 10,
          borderRadius: 8,
        }}
        onPress={() => navigation.openDrawer()}
      >
        <>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon
              icon={faAngleDoubleLeft}
              style={{ color: "#7B87A8" }}
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
      </TouchableHighlight>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          if (configStore.isFeatureEnabled("accountsTab")) {
            // TODO: i18n, types
            navigation.navigate("Accounts");
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
              defaultMessage="Wallet name"
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
            {isSmallScreenSubstr(walletName, "...", 15, 18)}
          </Text>
        </View>
        <View
          style={{
            borderRadius: 17.5,
            backgroundColor: "#ffffff",
          }}
        >
          <ObiLogo
            style={{
              width: 35,
              height: 35,
            }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
});
