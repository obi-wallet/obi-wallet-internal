import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { Platform, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QrCode } from "./qr-code";
import { useStore } from "../../../contexts";
import { isSmallScreenNumber, isWeb } from "../../../helpers";
import { OsmosisScreenContainer } from "../../osmosis-screen-container";

export const ReceiveScreen = observer(function ReceiveScreen() {
  const { configStore, walletsStore, sdkRootStore } = useStore();
  const theme = useTheme();

  function getAddress() {
    if (configStore.config.ethereumBalances) {
      return sdkRootStore.ethereumDemoStore.ethereumAccount?.address;
    }
    return walletsStore.address;
  }

  const address = getAddress();

  if (!address) return null;

  const onShare = async (text: string) => {
    if (isWeb()) {
      await navigator.clipboard.writeText(text);
    } else {
      try {
        const result = await Share.share({
          message: text,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (e) {
        const error = e as Error;
        alert(error.message);
      }
    }
  };

  return (
    <OsmosisScreenContainer>
      <SafeAreaView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingVertical: Platform.select({
            ios: isSmallScreenNumber(20, 20),
            android: isSmallScreenNumber(30, 30),
          }),
          justifyContent: "space-between",
        }}
      >
        <View style={{ zIndex: 2 }}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                width: "100%",
                textAlign: "center",
                color: "#F6F5FF",
                fontWeight: "600",
              }}
            >
              <FormattedMessage id="receive.receive" defaultMessage="Receive" />
            </Text>
          </View>
        </View>

        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              borderRadius: 16,
              backgroundColor: "white",
              padding: 10,
              marginBottom: "30%",
            }}
          >
            <QrCode value={address} size={200} />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.panelBackground,
              borderRadius: 12,
              paddingVertical: 20,
              paddingHorizontal: 30,
            }}
            onPress={() => {
              onShare(address);
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#F6F5FF",
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              {isWeb()
                ? "Click to copy your address"
                : "Tap to share your address"}
            </Text>
            <Text
              style={[
                {
                  textAlign: "center",
                  color: "#F6F5FF",
                  fontSize: 12,
                  fontWeight: "500",
                  opacity: 0.6,
                  marginTop: 10,
                },
                isWeb()
                  ? {
                      // @ts-expect-error web-only prop
                      overflowWrap: "anywhere",
                    }
                  : undefined,
              ]}
            >
              {address}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </OsmosisScreenContainer>
  );
});
