import styled from "@emotion/native";
import { useTheme } from "@emotion/react";
import { Feature } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import { FC, ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SvgProps } from "react-native-svg";

import { MultisigSettingsScreen } from "./multisig-settings";
import { OsmosisSettingsScreen } from "./osmosis-settings";
import { WhitelistedLpsScreen } from "./whitelisted-lps";
import { useStore } from "../../../contexts";
import { isSmallScreenNumber, isWeb } from "../../../helpers";
import {
  HomeBottomTabRoute,
  RootStack,
  SettingsRoute,
  useRootNavigation,
} from "../../../router";
import { HelpAndSupportIcon, LogoutIcon, MultisigIcon } from "../../icons";
import { OsmosisScreenContainer } from "../../osmosis-screen-container";

export const SettingsScreen = observer(function SettingsScreen() {
  const { configStore, walletsStore } = useStore();
  const intl = useIntl();
  const navigation = useRootNavigation();

  const isMultisigWallet = walletsStore.currentWallet !== null;
  const theme = useTheme();
  return (
    <OsmosisScreenContainer
      onBack={() => {
        navigation.navigate(HomeBottomTabRoute.Assets);
      }}
    >
      <Container>
        <View
          style={{
            marginTop: isSmallScreenNumber(20, 36),
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: isSmallScreenNumber(10, 36),
            paddingHorizontal: 22,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              paddingLeft: 0,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            {/* <BrandToggle
            style={{
              borderRadius: 32,
              marginRight: 10,
              marginLeft: 10,
            }}
          >
            <ObiIcon
              style={{
                width: 64,
                height: 64,
              }}
            />
          </BrandToggle> */}
            <View style={{ flexDirection: "column" }}>
              {theme.style === "ztx" ? (
                <View style={{ flexDirection: "row" }}>
                  <Text style={theme.titleFalvors?.title}>Obi</Text>
                  <Text style={theme.titleFalvors?.subTitle}>
                    {" "}
                    secure multisig account
                  </Text>
                </View>
              ) : (
                <Heading>
                  Obi {isMultisigWallet ? <>Secure Multisig </> : null}Account
                </Heading>
              )}
              {/*<Text style={styles.subHeading}>
              Profile picture, name and mail
            </Text>*/}
            </View>
            {/*
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", paddingLeft: 20 }}
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              style={styles.chevronRight}
            />
          </TouchableOpacity>
          */}
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
          }}
        >
          {/*
        <Setting
          Icon={MultiSigIcon}
          title="Account settings"
          subtitle="Manage accounts & sub-accounts "
          onPress={() => navigation.navigate("AccountsSettings")}
        />
      */}
          {isMultisigWallet ? (
            <>
              <Setting
                Icon={MultisigIcon}
                title={intl.formatMessage({
                  id: "settings.multigsigsettings",
                  defaultMessage: "Key Settings",
                })}
                subtitle={intl.formatMessage({
                  id: "settings.multigsigsettings.subtext",
                  defaultMessage: "Manage your SMS, social, and other keys.",
                })}
                onPress={() =>
                  navigation.navigate(SettingsRoute.MultisigSettings)
                }
                style={theme.settings?.panelContainer}
              />
              {/* <Setting
                Icon={NewSettingsIcon}
                title="Account Settings"
                subtitle="Manage your account settings."
                onPress={() =>
                  navigation.navigate(SettingsRoute.OsmosisSettings)
                }
                style={theme.settings?.panelContainer}
              />  */}
              {configStore.isFeatureEnabled(Feature.HealthChecks) ? (
                <Setting
                  Icon={MultisigIcon}
                  title={intl.formatMessage({
                    id: "settings.multisighealthchecks",
                    defaultMessage: "Wallet Health",
                  })}
                  subtitle={intl.formatMessage({
                    id: "settings.multisighealthchecks.subtext",
                    defaultMessage:
                      "Check for any potential issues in your wallet.",
                  })}
                  onPress={() =>
                    navigation.navigate(SettingsRoute.MultisigHealthChecks)
                  }
                  style={theme.settings?.panelContainer}
                />
              ) : null}
            </>
          ) : null}

          {Platform.OS !== "web" && (
            <View
              style={[
                styles.flex1,
                styles.separatorContainer,
                { flexDirection: "row" },
              ]}
            >
              <View style={[styles.separator]} />
              <Text style={[styles.separatorText]}>
                <FormattedMessage id="settings.more" defaultMessage="More" />
              </Text>
              <View style={[styles.separator]} />
            </View>
          )}
          {theme.style !== "ztx" && (
            <Setting
              Icon={HelpAndSupportIcon}
              title={intl.formatMessage({
                id: "settings.helpsupport",
                defaultMessage: "Help & Support",
              })}
              subtitle={intl.formatMessage({
                id: "settings.helpsupport.subtext.obi",
                defaultMessage: "Contact Obi support.",
              })}
              onPress={() => Linking.openURL("https://obi.money/contact")}
              style={theme.settings?.panelContainer}
            />
          )}

          <Setting
            Icon={() => <LogoutIcon fill="white" />}
            title={intl.formatMessage({
              id: "settings.logout",
              defaultMessage: "Log Out",
            })}
            subtitle={intl.formatMessage({
              id: "settings.logout.subtext",
              defaultMessage: "Save your keys before logging out.",
            })}
            onPress={() => {
              walletsStore.logout();
            }}
            style={theme.settings?.panelContainer || {}}
          />

          {theme.style !== "ztx" && (
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: 15,
                  }}
                >
                  {/*<Text*/}
                  {/*  onPress={() => {*/}
                  {/*    navigation.navigate("AddSubAccount");*/}
                  {/*  }}*/}
                  {/*  style={{*/}
                  {/*    color: "#F6F5FF",*/}
                  {/*    paddingRight: 10,*/}
                  {/*    fontSize: 10,*/}
                  {/*  }}*/}
                  {/*>*/}
                  {/*  <FormattedMessage*/}
                  {/*    id="settings.terms"*/}
                  {/*    defaultMessage="Terms of Service"*/}
                  {/*  />*/}
                  {/*</Text>*/}
                  <Text
                    onPress={() => {
                      const url = "https://www.obi.money/privacy-policy";
                      void Linking.openURL(url);
                    }}
                    style={{
                      color: "#F6F5FF",
                      marginLeft: 10,
                      fontSize: 10,
                    }}
                  >
                    <FormattedMessage
                      id="settings.privacy"
                      defaultMessage="Privacy Policy"
                    />
                  </Text>
                </View>

                <Text
                  style={{
                    color: "#F6F5FF",
                    marginLeft: 10,
                    marginBottom: 20,
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {/*Obi {appMetadata?.appVersion} {appMetadata?.label}*/}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </Container>
    </OsmosisScreenContainer>
  );
});

interface SettingProps {
  Icon?: FC<SvgProps>;
  title: string;
  subtitle: string;
  onPress?: () => void;
  children?: ReactNode;
  disableButton?: boolean;
  style?: ViewStyle | undefined;
}

export const Setting = observer(function Setting({
  Icon,
  title,
  subtitle,
  onPress,
  children,
  disableButton,
  style,
}: SettingProps) {
  const theme = useTheme();

  const renderContent = () => (
    <>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {Icon && (
          <View
            style={[
              {
                padding: 10,
                alignSelf: "flex-start",
                borderRadius: 12,
              },
              theme.iconButtonFlavors?.panel,
            ]}
          >
            <Icon
              fill="white"
              style={{
                width: theme.iconButtonFlavors?.panel.width,
                height: theme.iconButtonFlavors?.panel.height,
              }}
            />
          </View>
        )}
        <TilesContainer>
          <Heading style={[{ fontSize: 14 }, theme.textStyles.bold]}>
            {title}
          </Heading>
          <SubHeading>{subtitle}</SubHeading>
        </TilesContainer>
      </View>
      <View>{children}</View>
    </>
  );
  return disableButton ? (
    <SettingContainer>{renderContent()}</SettingContainer>
  ) : (
    <SettingButton onPress={() => onPress && onPress()} {...style}>
      {renderContent()}
    </SettingButton>
  );
});

const Container = styled.SafeAreaView({
  flex: 1,
  paddingHorizontal: 20,
});

const TilesContainer = styled.View({
  paddingHorizontal: 10,
  flex: 1,
});

const Heading = styled.Text(({ theme }) => {
  return {
    color: "#F6F5FF",
    fontSize: isSmallScreenNumber(14, 18),
    paddingBottom: 4,
    ...theme.textStyles.bold,
  };
});

const SubHeading = styled.Text(({ theme }) => ({
  color: "#F6F5FF",
  opacity: 0.6,
  fontSize: 12,
  ...theme.textStyles.regular,
  ...(isWeb() ? { wordBreak: "break-word" } : {}),
}));

const styles = StyleSheet.create({
  // @ts-expect-error `minHeight: "max-content"` is not in the react-native StyleSheet type
  setting: {
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    ...(isWeb()
      ? {
          minHeight: "max-content",
          paddingVertical: 10,
        }
      : {}),
  },
  flex1: {
    flex: 0,
    marginBottom: 18,
  },
  text: {
    color: "#fff",
  },
  separatorContainer: {
    alignItems: "center",
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#16152B",
    flex: 1,
  },
  separatorText: {
    color: "#787B9C",
    marginHorizontal: 35,
    textTransform: "uppercase",
  },
  chevronRight: {
    color: "#3D4661",
  },
});

const SettingContainer = styled.View(
  {
    ...styles.setting,
    ...styles.flex1,
  },
  ({ theme }) => [
    {
      backgroundColor: theme.colors.panelBackground,
    },
    theme.settings?.panelContainer,
  ],
);

const SettingButton = styled.TouchableOpacity(
  {
    ...styles.setting,
    ...styles.flex1,
  },
  ({ theme }) => [
    {
      backgroundColor: theme.colors.panelBackground,
    },
    theme.settings?.panelContainer,
  ],
);

export const settingsScreens = () => {
  return (
    <RootStack.Group>
      <RootStack.Screen
        name={SettingsRoute.MultisigSettings}
        key={SettingsRoute.MultisigSettings}
        component={MultisigSettingsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name={SettingsRoute.OsmosisSettings}
        key={SettingsRoute.OsmosisSettings}
        component={OsmosisSettingsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name={SettingsRoute.WhitelistedLPs}
        key={SettingsRoute.WhitelistedLPs}
        component={WhitelistedLpsScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Group>
  );
};
