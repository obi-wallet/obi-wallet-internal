//osmosis settings screen
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native-animatable";
import { Switch } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { Setting } from ".";
import { useStore } from "../../../contexts";
import { isSmallScreenNumber } from "../../../helpers";
import { RootRoute, RootStackParamList, SettingsRoute } from "../../../router";
import { Back } from "../../back";
import { TextInput } from "../../text-input";
import { Text } from "../../typography";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type OsmosisSettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  SettingsRoute.OsmosisSettings
>;

export const OsmosisSettingsScreen = observer<OsmosisSettingsScreenProps>(
  function OsmosisSettingsScreen({ navigation }) {
    const [spendLimit, setSpendLimit] = useState<string>("0");
    const isObi = useStore().configStore.isObi();
    const theme = useTheme();
    return (
      <SafeAreaView
        style={{ backgroundColor: theme.colors.background, flex: 1 }}
      >
        <View
          style={{
            marginTop: isObi ? 10 : isSmallScreenNumber(10, 25),
            paddingTop: isSmallScreenNumber(0, 32),
            paddingBottom: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ marginRight: -60, marginLeft: 10, zIndex: 2 }}>
            <Back />
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: isSmallScreenNumber(20, 24),
                fontWeight: "600",
              }}
            >
              Account Settings
            </Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <SessionKeySetting />
          <SessionKeySpendLimitSetting
            value={0}
            onChange={function (value: string): void {
              throw new Error("Function not implemented.");
            }} // onChange={(value: number) => {
            //   setSpendLimit(value);
            // }}
            // value={spendLimit}
          />
          {/* <SlippageLimitSetting /> */}
          <Setting
            title="Whitelisted LPs"
            subtitle="Manage whitelisted LPs"
            onPress={() => navigation.navigate(SettingsRoute.WhitelistedLPs)}
          ></Setting>
        </View>
      </SafeAreaView>
    );
  }
);
interface SessionKeySpendLimitSettingProps {
  value: number;
  onChange: (value: string) => void;
}

const SessionKeySpendLimitSetting = observer<SessionKeySpendLimitSettingProps>(
  function SessionKeySpendLimitSetting({ value, onChange }) {
    const theme = useTheme();
    const isObi = useStore().configStore.isObi();
    const getTextValue = () => {
      if (!value) return "$0";
      console.log("getTextCalled", value);
      if (value === 0) {
        return "";
      }
      return `$${value}`;
    };
    return (
      <Setting
        disableButton={true}
        title="Session Key Max Spend"
        subtitle="Any transaction up to this dollar amount won’t require a signature."
      >
        <View style={{ minWidth: 100, flex: 1, backgroundColor: "red" }}>
          <TextInput
            inputStyle={{
              fontSize: 14,
              backgroundColor: "#1a1a1a",
              borderWidth: 0,
            }}
            value={getTextValue()}
            onChangeText={(text: string) => {
              //get regex to only allow numbers, decimals and empty string
              const res = text.replace(/[^0-9.]/g, "");
              onChange(res);
            }}
          />
        </View>
      </Setting>
    );
  }
);
const SlippageLimitSetting = observer<SessionKeySpendLimitSettingProps>(
  function SessionKeySpendLimitSetting({ value, onChange }) {
    const theme = useTheme();
    const isObi = useStore().configStore.isObi();
    const getTextValue = () => {
      if (!value) return "0";
      console.log("getTextCalled", value);
      if (value === 0) {
        return "";
      }
      return `${value}%`;
    };
    return (
      <Setting
        disableButton={true}
        title="Slippage Limit"
        subtitle="Any transaction above the amount entered will automatically be declined."
      >
        <View
          style={{
            minWidth: 100,
            flex: 1,
            flexDirection: "row",

            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <TextInput
            inputStyle={{
              fontSize: 14,
              backgroundColor: "#1a1a1a",
              borderWidth: 0,
            }}
            value={getTextValue()}
            onChangeText={(text: string) => {
              const res = text.replace(/[^0-9./s]/g, "");
              onChange(res);
            }}
            style={{ flex: 1 }}
          />
          <Text style={{ fontSize: 20, color: "white" }}>%</Text>
        </View>
      </Setting>
    );
  }
);

const SessionKeySetting = observer(function SessionKeySetting() {
  const theme = useTheme();
  const isObi = useStore().configStore.isObi();
  return (
    <Setting
      disableButton={true}
      title="Session Key"
      subtitle="Enabling session key will only require you to sign one transaction when connecting your Osmosis smart account."
    >
      <Switch thumbColor="#437DFF" />
    </Setting>
  );
});
