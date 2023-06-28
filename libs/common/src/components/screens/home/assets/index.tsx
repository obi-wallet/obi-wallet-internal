import { useTheme } from "@emotion/react";
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

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginTop: isSmallScreenNumber(5, 15),
      }}
    >
      <Text
        style={{
          color: "#787B9C",
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
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
            ]}
            onPress={() => navigation.navigate(RootRoute.Send, {})}
          >
            <SendIcon
              width={25}
              height={25}
              viewBox={undefined}
              style={{ marginLeft: -5 }}
            />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 9,
              fontWeight: "500",
              marginTop: 10,
              letterSpacing: 0.09,
            }}
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
            />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 9,
              fontWeight: "500",
              marginTop: 10,
              letterSpacing: 0.09,
              textTransform: "none",
            }}
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
            ]}
            onPress={() => navigation.navigate(HomeBottomTabRoute.Settings)}
          >
            <NewSettingsIcon width={30} height={30} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 9,
              fontWeight: "500",
              marginTop: 10,
              letterSpacing: 0.09,
            }}
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

  return (
    <View
      style={{
        flexGrow: 1,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: isSmallScreenNumber(20, 40),
        backgroundColor: theme.colors.panelBackground,
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        paddingHorizontal: 16,
        marginHorizontal: 10,
      }}
    >
      <View
        style={{
          width: "100%",
        }}
      >
        <View
          style={{
            height: 20,
            width: "100%",
            marginTop: 30,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              balances.refetch();
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 11,
                letterSpacing: 0.7,
                textTransform: "uppercase",
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
                fontSize: 11,
                letterSpacing: 0.7,
                textTransform: "uppercase",
              }}
            >
              <FormattedMessage
                id="assets.holdings"
                defaultMessage="Holdings"
              />
            </Text>
            <IconButton
              style={{ justifyContent: "center", marginBottom: 5 }}
              onPress={() => {
                setSortAscending((value) => !value);
              }}
            >
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
            </IconButton>
          </View>
        </View>

        <RefreshableFlatList
          keyExtractor={(token) => token.id}
          data={balances.data}
          renderItem={(props) => <AssetsListItem {...props} />}
          style={
            isWeb()
              ? {
                  marginTop: 10,
                }
              : {
                  marginTop: 28,
                }
          }
          refetch={balances.refetch}
        />
      </View>
    </View>
  );
});

const AssetsListItem = observer(function AssetsListItem({
  item,
}: ListRenderItemInfo<EnrichedToken>) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
        alignItems: "center",
        marginBottom: 28,
      }}
    >
      <TouchableOpacity onPress={async () => onTouchAsset(item.amount)}>
        <View
          style={{
            height: 36,
            width: 36,
            backgroundColor: item.icon ? "transparent" : "#ccc",
            borderRadius: 10,
            marginRight: 12,
          }}
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
            <Text style={{ color: "#F6F5FF", fontSize: 14, fontWeight: "500" }}>
              {isSmallScreenSubstr(item.label, "...", 23, 30)}
            </Text>
            <Text
              style={{
                color: "rgba(246, 245, 255, 0.6)",
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
