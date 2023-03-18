import styled from "@emotion/native";
import { useTheme } from "@emotion/react";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  Feature,
  RequestObiSignAndBroadcastTerraTransactionMsg,
  terra,
  Text,
} from "@obi-wallet/common";
import {
  cosmosChains,
  isCosmosChain,
  TerraChain,
  terraChains,
} from "@obi-wallet/sdk";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerScreenProps,
} from "@react-navigation/drawer";
import { ParamListBase } from "@react-navigation/native";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { Platform, TouchableOpacity, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import invariant from "tiny-invariant";

import AppsIcon from "./assets/appsIcon.svg";
import AssetsIcon from "./assets/assetsIcon.svg";
import ObiAccountsIcon from "./assets/empty-account-icon.svg";
import ObiAppsIcon from "./assets/empty-app-menu-icon.svg";
import ObiSettingsIcon from "./assets/empty-cog-icon.svg";
import ObiAssetsIcon from "./assets/empty-wallet-icon.svg";
import ObiAccountsActiveIcon from "./assets/filled-account-icon.svg";
import ObiAppsIconActive from "./assets/filled-app-menu-icon.svg";
import ObiSettingsActiveIcon from "./assets/filled-cog-icon.svg";
import ObiAssetsActiveIcon from "./assets/filled-wallet-icon.svg";
import AppsIconActive from "./assets/ic_apps_active.svg";
import AssetsIconActive from "./assets/ic_assets_active.svg";
import NFTsIconActive from "./assets/ic_nfts_active.svg";
import SettingsIconActive from "./assets/ic_settings_active.svg";
import TradeIconActive from "./assets/ic_trade_active.svg";
import NFTsIcon from "./assets/nftsIcon.svg";
import SettingsIcon from "./assets/settingsIcon.svg";
import TradeIcon from "./assets/tradeIcon.svg";
import { Assets } from "./components/assets";
import {
  HomeBottomTab,
  HomeBottomTabRoute,
  HomeDrawer,
  HomeDrawerRoute,
} from "./home-stack";
import { useQuery } from "../../../queries";
import { getCodeIdsQuery } from "../../../queries/user-account";
import { AccountsScreen } from "../../../screens/accounts";
import { useStore } from "../../stores";
import {
  getScreenDimensions,
  isSmallScreenNumber,
} from "../components/screen-size";
import { DappExplorer } from "../dapp-explorer";
import { NFTs } from "../loop-web-apps/nfts";
import { Trade } from "../loop-web-apps/trade";
import { SettingsScreen } from "../settings";

export type TabNavigationProps = DrawerScreenProps<ParamListBase>;
const ActiveIconContainer = styled.View({
  backgroundColor: "#ffffff80",
  borderRadius: 9,
  padding: 5,
});
export const TabNavigation = observer<TabNavigationProps>(
  function TabNavigation() {
    const intl = useIntl();
    const { configStore } = useStore();
    const isLoop = configStore.isLoop();
    const isObi = configStore.isObi();

    return (
      <HomeBottomTab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const routeName = route.name as HomeBottomTabRoute;
            switch (routeName) {
              case HomeBottomTabRoute.Accounts:
                return focused ? (
                  <ActiveIconContainer>
                    <ObiAccountsActiveIcon width={28} height={28} />
                  </ActiveIconContainer>
                ) : (
                  <ObiAccountsIcon width={32} height={32} />
                );
              case HomeBottomTabRoute.Assets:
                if (isLoop)
                  return focused ? <AssetsIconActive /> : <AssetsIcon />;
                return focused ? (
                  <ActiveIconContainer>
                    <ObiAssetsActiveIcon width={28} height={28} />
                  </ActiveIconContainer>
                ) : (
                  <ObiAssetsIcon width={32} height={32} />
                );
              case HomeBottomTabRoute.Apps:
                if (isLoop) return focused ? <AppsIconActive /> : <AppsIcon />;
                return focused ? (
                  <ActiveIconContainer>
                    <ObiAppsIconActive width={28} height={28} />
                  </ActiveIconContainer>
                ) : (
                  <ObiAppsIcon width={28} height={28} />
                );
              case HomeBottomTabRoute.Nfts:
                return focused ? <NFTsIconActive /> : <NFTsIcon />;
              case HomeBottomTabRoute.Trade:
                return focused ? <TradeIconActive /> : <TradeIcon />;
              case HomeBottomTabRoute.Settings:
                if (isLoop)
                  return focused ? <SettingsIconActive /> : <SettingsIcon />;
                return focused ? (
                  <ActiveIconContainer>
                    <ObiSettingsActiveIcon width={28} height={28} />
                  </ActiveIconContainer>
                ) : (
                  <ObiSettingsIcon width={28} height={28} />
                );
            }
          },
          tabBarStyle: {
            backgroundColor: isLoop ? "#17162C" : "#437DFF",
            borderTopColor: "#1E1D33",
            borderTopWidth: 1,
            paddingTop: 20,
            paddingBottom: Platform.select({
              ios: isSmallScreenNumber(
                getScreenDimensions().SCREEN_HEIGHT <= 667 ? 10 : 25,
                27
              ),
              android: 10,
            }),
            height: Platform.select({
              ios: isSmallScreenNumber(
                getScreenDimensions().SCREEN_HEIGHT <= 667 ? 65 : 82,
                85
              ),
              android: 65,
            }),
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: isLoop ? "#F6F5FF" : "white",
          tabBarInactiveTintColor: isLoop ? "#4D5070" : "white",
          tabBarLabelStyle: {
            fontFamily: isObi ? "poppins-light" : "Inter",
            fontSize: isObi ? 8 : 10,
            fontWeight: isObi ? "normal" : "500",
            textTransform: isLoop ? "uppercase" : "none",
            marginTop: 15,
            letterSpacing: 0.6,
          },
          lazy: false,
        })}
        initialRouteName={HomeBottomTabRoute.Assets}
        tabBar={(props) => {
          return (
            <>
              <UpdateFooter />
              <BottomTabBar {...props} />
            </>
          );
        }}
      >
        {configStore.isFeatureEnabled(Feature.AccountsTab) ? (
          <HomeBottomTab.Screen
            name={HomeBottomTabRoute.Accounts}
            options={{
              title: intl.formatMessage({
                id: "menu.accounts",
                defaultMessage: "Accounts",
              }),
            }}
            component={AccountsScreen}
          />
        ) : null}
        <HomeBottomTab.Screen
          name={HomeBottomTabRoute.Assets}
          options={{
            title: intl.formatMessage({
              id: "menu.assets",
              defaultMessage: "Assets",
            }),
          }}
          component={Assets}
        />
        {configStore.isFeatureEnabled(Feature.NftTab) ? (
          <HomeBottomTab.Screen
            name={HomeBottomTabRoute.Nfts}
            options={{
              title: intl.formatMessage({
                id: "menu.nfts",
                defaultMessage: "NFTs",
              }),
            }}
            component={NFTs}
          />
        ) : null}
        <HomeBottomTab.Screen
          name={HomeBottomTabRoute.Apps}
          options={{
            title: intl.formatMessage({
              id: "menu.apps",
              defaultMessage: "Apps",
            }),
          }}
          component={DappExplorer}
        />
        {isLoop && (
          <HomeBottomTab.Screen
            name={HomeBottomTabRoute.Trade}
            options={{
              title: intl.formatMessage({
                id: "menu.trade",
                defaultMessage: "Trade",
              }),
            }}
            component={Trade}
          />
        )}
        <HomeBottomTab.Screen
          name={HomeBottomTabRoute.Settings}
          options={{
            title: intl.formatMessage({
              id: "menu.settings",
              defaultMessage: "Settings",
            }),
          }}
          component={SettingsScreen}
        />
      </HomeBottomTab.Navigator>
    );
  }
);

export const HomeScreen = observer(function HomeScreen() {
  const { chainStore } = useStore();

  return (
    <>
      <HomeDrawer.Navigator
        initialRouteName={chainStore.currentChainInformation.label}
        screenOptions={{
          headerShown: false,
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <HomeDrawer.Screen
          name={HomeDrawerRoute.HomeDrawer}
          component={TabNavigation}
        />
      </HomeDrawer.Navigator>
    </>
  );
});

const UpdateFooter = observer(function UpdateHeader() {
  const { walletsStore } = useStore();
  const theme = useTheme();

  const wallet = walletsStore.currentWallet;

  const codeIdsQuery = getCodeIdsQuery({
    chainId: wallet?.chain,
    address: wallet?.proxyAddress.address,
  });
  const { data: codeIds, isRefetching, refetch } = useQuery(codeIdsQuery);

  const outdated = codeIds && wallet?.isOutdated(codeIds);
  if (!outdated || isRefetching) return null;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "#FFE200",
        padding: theme.spacing["12"],
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onPress={async () => {
        invariant(wallet, "Expected `wallet` to exist.");
        const proxyAddress = wallet.proxyAddress;

        const signers = terra.getSigners({
          multisigKey: wallet.owner,
        });
        const message = terra.getMigrateMessage({
          proxyAddress: proxyAddress.address,
          admin: wallet.owner.address,
          chainId: wallet.chain as TerraChain,
          signers,
          codeIds,
        });

        try {
          await RequestObiSignAndBroadcastTerraTransactionMsg.send({
            chain: wallet.chain as TerraChain,
            messages: [message.toAmino()],
            demoMode: wallet.isDemo,
            cancelable: true,
            multisigKey: wallet.owner.toJSON(),
          });
        } finally {
          await refetch({
            throwOnError: true,
          });
        }
      }}
    >
      <View style={{ flexShrink: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <FontAwesomeIcon icon={faWarning} style={{ color: "#000" }} />
          <View style={{ marginLeft: theme.spacing["8"] }}>
            <Text style={{ color: "#000000" }}>Verified Update Available</Text>
            <Text
              style={{
                color: "#000000",
                ...theme.typography.caption2,
              }}
            >
              Update your Obi Smart Account to continue testing.
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          backgroundColor: "#ffffff",
          paddingVertical: theme.spacing["4"],
          paddingHorizontal: theme.spacing["8"],
          borderRadius: 6,
          flexShrink: 0,
        }}
      >
        <Text>Update</Text>
      </View>
    </TouchableOpacity>
  );
});

const CustomDrawerContent = observer(function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  const { navigation } = props;
  const { chainStore, configStore } = useStore();

  const isLoop = configStore.isLoop();
  const networks = configStore.config.chains.enabled.map((chainId) => {
    if (isCosmosChain(chainId)) {
      return cosmosChains[chainId];
    } else {
      return terraChains[chainId];
    }
  });

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: isLoop ? "#100F1E" : "#437DFF" }}
    >
      <TouchableHighlight
        style={{
          alignSelf: "flex-start",
          padding: 5,
          marginTop: 10,
          marginLeft: 16,
          marginBottom: 30,
        }}
        onPress={() => navigation.closeDrawer()}
      >
        <FontAwesomeIcon
          icon={faTimes}
          style={{ color: isLoop ? "#4d5070" : "white" }}
        />
      </TouchableHighlight>
      <Text
        style={{
          color: isLoop ? "#787B9C" : "white",
          marginLeft: 16,
          marginBottom: 17,
          fontSize: 11,
          textTransform: "uppercase",
        }}
      >
        <FormattedMessage id="sidemenu.networks" defaultMessage="Networks" />
      </Text>

      {networks.map((network) => {
        return (
          <DrawerItem
            focused={chainStore.currentChain === network.chainId}
            key={network.chainId}
            label={network.label}
            activeTintColor="#F6F5FF"
            inactiveTintColor={isLoop ? "#787B9C" : "#aaa"}
            activeBackgroundColor={
              isLoop ? "#27253E" : "rgba(255, 255, 255, 0.1)"
            }
            labelStyle={{
              fontFamily: "Inter",
              fontSize: 16,
              fontWeight: "500",
            }}
            onPress={action(() => {
              chainStore.setCurrentChain(network.chainId);
              navigation.closeDrawer();
            })}
          />
        );
      })}
      <Text
        style={{
          color: isLoop ? "#787B9C" : "white",
          marginLeft: 16,
          marginTop: 17,
          fontSize: 11,
          textTransform: "uppercase",
        }}
      >
        <FormattedMessage
          id="sidemenu.morecomingsoon"
          defaultMessage="More coming soon"
        />
      </Text>
    </DrawerContentScrollView>
  );
});
