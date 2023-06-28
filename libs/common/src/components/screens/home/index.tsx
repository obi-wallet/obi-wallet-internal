import styled from "@emotion/native";
import { useTheme } from "@emotion/react";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useQuery, useRootStore } from "@obi-wallet/headless-ui";
import { Chain } from "@obi-wallet/sdk";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerScreenProps,
} from "@react-navigation/drawer";
import { ParamListBase } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import invariant from "tiny-invariant";

import { Assets } from "./assets";
import { useStore } from "../../../contexts";
import {
  Alert,
  getScreenDimensions,
  isSmallScreenNumber,
} from "../../../helpers";
import { getIsOutdatedQuery } from "../../../queries";
import {
  HomeBottomTab,
  HomeBottomTabRoute,
  HomeDrawer,
  HomeDrawerRoute,
  RootRoute,
  RootStackParamList,
} from "../../../router";
import {
  ObiAccountsActiveIcon,
  ObiAccountsIcon,
  ObiAssetsActiveIcon,
  ObiAssetsIcon,
  ObiSettingsActiveIcon,
  ObiSettingsIcon,
} from "../../icons";
import { Text } from "../../typography";
import { LoginScreen } from "../login";
import { SettingsScreen } from "../settings";

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  RootRoute.Home
>;

const ActiveIconContainer = styled.View({
  backgroundColor: "#ffffff80",
  borderRadius: 9,
  padding: 5,
});

export type TabNavigationProps = DrawerScreenProps<ParamListBase>;

export const TabNavigation = observer<TabNavigationProps>(
  function TabNavigation() {
    const intl = useIntl();
    const theme = useTheme();

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
                return focused ? (
                  <ActiveIconContainer>
                    <ObiAssetsActiveIcon width={28} height={28} />
                  </ActiveIconContainer>
                ) : (
                  <ObiAssetsIcon width={32} height={32} />
                );
              case HomeBottomTabRoute.Settings:
                return focused ? (
                  <ActiveIconContainer>
                    <ObiSettingsActiveIcon width={28} height={28} />
                  </ActiveIconContainer>
                ) : (
                  <ObiSettingsIcon width={28} height={28} />
                );
              // TODO: not used in modal
              case HomeBottomTabRoute.Apps:
                return null;
              default:
                return null;
            }
          },
          tabBarStyle: {
            backgroundColor: "#437DFF",
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
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "white",
          tabBarLabelStyle: {
            ...theme.textStyles.light,
            fontSize: 8,
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
              {/* <BottomTabBar {...props} /> */}
            </>
          );
        }}
      >
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
        <HomeBottomTab.Screen
          name={HomeBottomTabRoute.Login}
          component={LoginScreen}
        />
      </HomeBottomTab.Navigator>
    );
  }
);

export const HomeScreen = observer<HomeScreenProps>(function HomeScreen(props) {
  const { chainStore } = useStore();

  // TODO: drawer not working in web
  // @ts-expect-error props are not used
  return <TabNavigation />;

  return (
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
  );
});

const UpdateFooter = observer(function UpdateFooter() {
  const { walletsStore } = useStore();
  const theme = useTheme();

  const wallet = walletsStore.currentWallet;

  const isOutdatedQuery = getIsOutdatedQuery(wallet);
  const { data: isOutdated, isRefetching, refetch } = useQuery(isOutdatedQuery);

  if (!isOutdated || isRefetching) return null;

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
        const response = await wallet.update();

        if (response.approved && !response.payload.success) {
          console.log(response.payload.rawLog);
          Alert.alert("Transaction failed", response.payload.rawLog);
        }

        await refetch({
          throwOnError: true,
        });
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
  // TODO:
  return null;

  const { navigation } = props;
  const { chainStore, configStore } = useStore();
  const theme = useTheme();

  const networks = configStore.config.chains.enabled.map(Chain.information);

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: "#437DFF" }}>
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
        <FontAwesomeIcon icon={faTimes} style={{ color: "white" }} />
      </TouchableHighlight>
      <Text
        style={{
          color: "white",
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
            inactiveTintColor="#aaa"
            activeBackgroundColor="rgba(255, 255, 255, 0.1)"
            labelStyle={[
              theme.textStyles.regular,
              {
                fontSize: 16,
              },
            ]}
            onPress={action(() => {
              chainStore.setCurrentChain(network.chainId);
              navigation.closeDrawer();
            })}
          />
        );
      })}
      <Text
        style={{
          color: "white",
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
