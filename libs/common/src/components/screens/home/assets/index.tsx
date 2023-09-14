import { useTheme } from "@emotion/react";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons/faAngleUp";
import { faSortAsc } from "@fortawesome/free-solid-svg-icons/faSortAsc";
import { faSortDesc } from "@fortawesome/free-solid-svg-icons/faSortDesc";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  ListRenderItemInfo,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import {
  isSmallScreenNumber,
  isSmallScreenSubstr,
  isWeb,
} from "../../../../helpers";
import {
  EnrichedToken,
  UsdBalance,
  useEnrichedBalances,
} from "../../../../hooks";
import {
  HomeBottomTabRoute,
  RootRoute,
  RootStackParamList,
} from "../../../../router";
import { IconButton } from "../../../buttons";
import {
  CoinIcon,
  NewSettingsIcon,
  ReceiveIcon,
  SendIcon,
} from "../../../icons";
import { NetworkAccountPickerLayout } from "../../../network-account-picker-layout";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import { RefreshableFlatList } from "../../../refreshable-flat-list";
import { Text } from "../../../typography";

export const Assets = observer(function Assets() {
  return (
    <OsmosisScreenContainer>
      <NetworkAccountPickerLayout>
        <BalanceAndActions />
        <AssetsList />
      </NetworkAccountPickerLayout>
    </OsmosisScreenContainer>
  );
});

const BalanceAndActions = observer(function BalanceAndActions() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const wallet = useCurrentWallet();
  const theme = useTheme();
  console.log({ theme });
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginTop: isSmallScreenNumber(5, 15),
      }}
    >
      <Text
        style={[
          {
            color: "#F6F8FC",
            fontSize: 11,
            fontWeight: "500",
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: 0.7,
          },
          theme.balance?.title,
        ]}
      >
        <FormattedMessage id="assets.balance" defaultMessage="Balance" />
      </Text>

      <UsdBalance address={wallet.address} chainId={wallet.chainId} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          width: 300,
          marginTop: isSmallScreenNumber(10, 36),
        }}
      >
        <View style={{ alignItems: "center" }}>
          <TouchableHighlight
            style={[
              theme.iconButtonFlavors.primary,
              {
                width: 56,
                height: 56,
                borderRadius: 56,
                justifyContent: "center",
                alignItems: "center",
              },
              theme.balance?.button,
            ]}
            onPress={() => navigation.navigate(RootRoute.Send, {})}
          >
            <SendIcon
              width={25}
              height={25}
              viewBox={undefined}
              style={{ marginLeft: -5 }}
              themeMode={theme.balance?.style}
            />
          </TouchableHighlight>
          <Text
            style={[
              {
                color: "#F6F5FF",
                fontSize: 9,
                fontWeight: "500",
                marginTop: 10,
                letterSpacing: 0.09,
              },
              theme.balance?.buttonLabel,
            ]}
          >
            <FormattedMessage id="assets.send" defaultMessage="Send" />
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableHighlight
            style={[
              theme.iconButtonFlavors.primary,
              {
                width: 56,
                height: 56,
                borderRadius: 56,
                justifyContent: "center",
                alignItems: "center",
              },
              theme.balance?.button,
            ]}
            onPress={() => navigation.navigate(RootRoute.Receive)}
          >
            <ReceiveIcon
              width={25}
              height={25}
              viewBox={undefined}
              style={{
                marginTop: -5,
              }}
              themeMode={theme.balance?.style}
            />
          </TouchableHighlight>
          <Text
            style={[
              {
                color: "#F6F5FF",
                fontSize: 9,
                fontWeight: "500",
                marginTop: 10,
                letterSpacing: 0.09,
                textTransform: "none",
              },
              theme.balance?.buttonLabel,
            ]}
          >
            <FormattedMessage id="assets.receive" defaultMessage="Receive" />
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <TouchableHighlight
            style={[
              theme.iconButtonFlavors.primary,
              {
                width: 56,
                height: 56,
                borderRadius: 56,
                justifyContent: "center",
                alignItems: "center",
              },
              theme.balance?.button,
            ]}
            onPress={() => navigation.navigate(HomeBottomTabRoute.Settings)}
          >
            <NewSettingsIcon
              width={30}
              height={30}
              themeMode={theme.balance?.style}
            />
          </TouchableHighlight>
          <Text
            style={[
              {
                color: "#F6F5FF",
                fontSize: 9,
                fontWeight: "500",
                marginTop: 10,
                letterSpacing: 0.09,
              },
              theme.balance?.buttonLabel,
            ]}
          >
            Settings
          </Text>
        </View>

        {/* {configStore.isFeatureEnabled(Feature.Staking) && (
          <View style={{ alignItems: "center" }}>
            <TouchableHighlight
              style={{
                width: 56,
                height: 56,
                backgroundColor: isLoop ? "#100F1E" : "#437DFF",
                borderRadius: isLoop ? 16 : 56,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => navigation.navigate(RootRoute.Stake)}
            >
              <StakingIcon width={25} height={25} />
            </TouchableHighlight>
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 9,
                fontWeight: "500",
                marginTop: 10,
                letterSpacing: 0.09,
                textTransform: isLoop ? "uppercase" : "none",
              }}
            >
              <FormattedMessage id="assets.staking" defaultMessage="Staking" />
            </Text>
          </View>
        )} */}
      </View>
    </View>
  );
});

const AssetsList = observer(function AssetsList() {
  const [sortAscending, setSortAscending] = useState(true);
  const wallet = useCurrentWallet();
  const balances = useEnrichedBalances({
    address: wallet.address,
    chainId: wallet.chainId,
    sortAscending,
  });
  const theme = useTheme();

  console.log({ balances });
  return (
    <View
      style={[
        {
          flexGrow: 1,
          flexDirection: "row",
          justifyContent: "center",
          marginTop: isSmallScreenNumber(20, 40),
          backgroundColor: theme.colors.panelBackground,
          borderTopLeftRadius: 7,
          borderTopRightRadius: 7,
          paddingHorizontal: 16,
          marginHorizontal: 10,
        },
        theme.balance?.assets,
      ]}
    >
      <View
        style={{
          width: "100%",
        }}
      >
        <View
          style={[
            {
              height: 50,
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomColor: "white",
              borderBottomWidth: 1,
              paddingHorizontal: 22,
            },
            theme.balance?.assetsHeader,
          ]}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              balances.refetch();
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: theme.balance?.assetsHeader?.fontSize || 11,
                letterSpacing: 0.7,
                textTransform:
                  theme.balance?.assetsHeader?.textTransform || "uppercase",
              }}
            >
              <FormattedMessage id="assets.name" defaultMessage="Name" />
            </Text>
          </TouchableWithoutFeedback>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: theme.balance?.assetsHeader?.fontSize || 11,
                letterSpacing: 0.7,
                textTransform:
                  theme.balance?.assetsHeader?.textTransform || "uppercase",
              }}
            >
              <FormattedMessage
                id="assets.holdings"
                defaultMessage="Holdings"
              />
            </Text>
            <IconButton
              style={{ justifyContent: "center" }}
              onPress={() => {
                setSortAscending((value) => !value);
              }}
            >
              {theme.balance?.style === "ztx" ? (
                <>
                  <FontAwesomeIcon
                    icon={faAngleUp}
                    style={{
                      color: sortAscending
                        ? "#FFFFFF"
                        : "rgba(255, 255, 255, 0.3)",
                      marginLeft: 12,
                      width: 10,
                      height: 6,
                      outline: "none",
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    style={{
                      color: sortAscending
                        ? "rgba(255, 255, 255, 0.3)"
                        : "#FFFFFF",
                      marginLeft: 12,
                      // marginTop: -15,
                      width: 10,
                      height: 6,
                      outline: "none",
                    }}
                  />
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faSortAsc}
                    style={{
                      color: sortAscending ? "#F6F5FF" : "#7E7E7E",
                      marginLeft: 12,
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faSortDesc}
                    style={{
                      color: sortAscending ? "#7E7E7E" : "#F6F5FF",
                      marginLeft: 12,
                      marginTop: -15,
                    }}
                  />
                </>
              )}
            </IconButton>
          </View>
        </View>

        <View
          style={[
            isWeb()
              ? {
                  marginTop: 10,
                }
              : {
                  marginTop: 28,
                },
            {
              paddingHorizontal: 22,
            },
            theme.balance?.assetsList,
          ]}
        >
          <RefreshableFlatList
            keyExtractor={(token) => token.id}
            data={balances.data}
            renderItem={(props) => <AssetsListItem {...props} />}
            refetch={balances.refetch}
          />
        </View>
      </View>
    </View>
  );
});

const AssetsListItem = observer(function AssetsListItem({
  item,
}: ListRenderItemInfo<EnrichedToken>) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useTheme();

  const onTouchAsset = (amount: number) => {
    if (Number(amount) > 0) {
      navigation.navigate(RootRoute.Send, { asset: item });
    } else {
      navigation.navigate(RootRoute.Receive);
    }
  };

  return (
    <View
      style={{
        height: 36,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 28,
      }}
    >
      <TouchableOpacity onPress={async () => onTouchAsset(item.amount)}>
        <View
          style={[
            {
              height: 36,
              width: 36,
              backgroundColor: item.icon ? "transparent" : "#ccc",
              borderRadius: 10,
              marginRight: 12,
            },
            theme.balance?.assetIcon,
          ]}
        >
          <CoinIcon source={item.icon} />
        </View>
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          height: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <TouchableOpacity onPress={async () => onTouchAsset(item.amount)}>
            <Text
              style={{
                color: theme.balance?.assetIcon?.labelColor || "#F6F5FF",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {isSmallScreenSubstr(item.label, "...", 23, 30)}
            </Text>
            <Text
              style={{
                color:
                  theme.balance?.assetIcon?.denomColor ||
                  "rgba(246, 245, 255, 0.6)",
                fontSize: 12,
                fontWeight: "400",
                marginTop: 4,
              }}
            >
              {item.denom}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 14,
                fontWeight: "500",
                textAlign: "right",
              }}
            >
              ${(item.usdValue ?? 0).toFixed(2)}
            </Text>
          </View>

          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: 12,
              fontWeight: "400",
              textAlign: "right",
              marginTop: 4,
            }}
          >
            {item.amount} {item.denom}
          </Text>
        </View>
      </View>
    </View>
  );
});
