import styled from "@emotion/native";
import {
  BrandToggle,
  isSmallScreenNumber,
  ObiIcon,
  RootStack,
  SettingsRoute,
  useRootNavigation,
  useStore,
} from "@obi-wallet/common";
import { Brand, Feature } from "@obi-wallet/config";
import * as Sentry from "@sentry/react-native";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import codePush, { LocalPackage } from "react-native-code-push";
import { SvgProps } from "react-native-svg";
import { useAsyncEffect } from "rooks";

import MultiSigIcon from "./assets/edit.svg";
import HelpAndSupport from "./assets/headset.svg";
import LogoutIcon from "./assets/power-red.svg";
// import { HealthChecksScreen } from "./health-checks";
import { KeysConfigScreen } from "./keys-config";
import CogIcon from "../home/assets/obi-settings-active.svg";

export const SettingsScreen = observer(function SettingsScreen() {
  const { configStore, walletsStore } = useStore();
  const isObi = configStore.isObi();
  const isLoop = configStore.isLoop();
  const intl = useIntl();
  const navigation = useRootNavigation();
  const [appMetadata, setAppMetadata] = useState<LocalPackage | null>(null);
  useAsyncEffect(async () => {
    const metadata = await codePush.getUpdateMetadata();
    if (metadata) {
      Sentry.setTag("codepush_release", metadata.label);
    }
    setAppMetadata(metadata);
  }, []);

  const isMultisigWallet = walletsStore.currentWallet !== null;

  return (
    <Container>
      <View
        style={{
          marginTop: isSmallScreenNumber(20, 61),
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: isSmallScreenNumber(10, 40),
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
          <BrandToggle
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
          </BrandToggle>

          <View style={{ flexDirection: "column" }}>
            <Heading>
              Obi {isMultisigWallet ? <>Secure Multisig </> : null}Account
            </Heading>
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
      <ScrollView>
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
              Icon={MultiSigIcon}
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
            />
            <Setting
              Icon={CogIcon}
              title="Account Settings"
              subtitle="Manage your account settings."
              onPress={() => navigation.navigate(SettingsRoute.OsmosisSettings)}
            />
            {configStore.isFeatureEnabled(Feature.HealthChecks) ? (
              <Setting
                Icon={MultiSigIcon}
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
        <Setting
          Icon={HelpAndSupport}
          title={intl.formatMessage({
            id: "settings.helpsupport",
            defaultMessage: "Help & Support",
          })}
          subtitle={intl.formatMessage(
            isObi
              ? {
                  id: "settings.helpsupport.subtext.obi",
                  defaultMessage: "Contact Obi support.",
                }
              : {
                  id: "settings.helpsupport.subtext",
                  defaultMessage: "Contact Loop support.",
                }
          )}
          onPress={() =>
            Linking.openURL(
              isObi ? "https://obi.money/contact" : "https://loop.markets/help"
            )
          }
        />

        <Setting
          Icon={() => <LogoutIcon fill={isLoop ? "#E36B7D" : "white"} />}
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
        />

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
                  const url = configStore.isObi()
                    ? "https://www.obi.money/privacy-policy"
                    : "https://mail.loop.onl/privacy-policy/";
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
              Obi {appMetadata?.appVersion} {appMetadata?.label}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
});

interface SettingProps {
  Icon?: FC<SvgProps>;
  title: string;
  subtitle: string;
  onPress?: () => void;
  children?: React.ReactNode;
  disableButton?: boolean;
}

export const Setting = observer(function Setting({
  Icon,
  title,
  subtitle,
  onPress,
  children,
  disableButton,
}: SettingProps) {
  const { configStore } = useStore();
  const brand = configStore.brand;
  const isLoop = configStore.isLoop();
  const renderContent = () => (
    <>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {Icon && (
          <View
            style={{
              padding: 10,
              backgroundColor: isLoop ? "#1D1C37" : "#437DFF",
              alignSelf: "flex-start",

              borderRadius: 12,
            }}
          >
            <Icon fill={isLoop ? "#7B87A8" : "white"} />
          </View>
        )}
        <TilesContainer>
          <Heading style={[{ fontSize: 14 }]}>{title}</Heading>
          <SubHeading>{subtitle}</SubHeading>
        </TilesContainer>
      </View>
      <View>{children}</View>
    </>
  );
  return (
    <SettingButton
      onPress={() => onPress && onPress()}
      brand={brand}
      disabled={disableButton}
    >
      {renderContent()}
    </SettingButton>
  );
});

const Container = styled.SafeAreaView(
  {
    flex: 1,
    paddingHorizontal: 20,
  },
  (props) => ({ backgroundColor: props.theme.colors.background })
);

const TilesContainer = styled.View({
  paddingHorizontal: 10,
});

const Heading = styled.Text({
  color: "#F6F5FF",
  fontSize: isSmallScreenNumber(14, 18),
  fontWeight: "700",
  fontFamily: "Inter",
  paddingBottom: 4,
});
const SubHeading = styled.Text({
  color: "#F6F5FF",
  opacity: 0.6,
  fontSize: 12,
});

const styles = StyleSheet.create({
  setting: {
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flex1: {
    flex: 0,
    marginBottom: 20,
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
const SettingButton = styled.TouchableOpacity<{ brand: Brand }>(
  {
    ...styles.setting,
    ...styles.flex1,
  },
  (props) => ({
    backgroundColor: props.brand === Brand.Loop ? "#111023" : "#272727",
  })
);

// This can't be a React component because `Stack.Navigator` doesn't want that.
export const settingsScreens = () => {
  return (
    <RootStack.Group>
      <RootStack.Screen
        name={SettingsRoute.MultisigSettings}
        key={SettingsRoute.MultisigSettings}
        component={KeysConfigScreen}
        options={{ headerShown: false }}
      />

      {/*<RootStack.Screen*/}
      {/*  name={SettingsRoute.MultisigHealthChecks}*/}
      {/*  key={SettingsRoute.MultisigHealthChecks}*/}
      {/*  component={HealthChecksScreen}*/}
      {/*  options={{ headerShown: false }}*/}
      {/*/>*/}
      {/*<RootStack.Screen*/}
      {/*  name={SettingsRoute.OsmosisSettings}*/}
      {/*  key={SettingsRoute.OsmosisSettings}*/}
      {/*  component={OsmosisSettingsScreen}*/}
      {/*  options={{ headerShown: false }}*/}
      {/*/>*/}
      {/*<RootStack.Screen*/}
      {/*  name={SettingsRoute.WhitelistedLPs}*/}
      {/*  key={SettingsRoute.WhitelistedLPs}*/}
      {/*  component={WhitelistedLPsScreen}*/}
      {/*  options={{ headerShown: false }}*/}
      {/*/>*/}
    </RootStack.Group>
  );
};
