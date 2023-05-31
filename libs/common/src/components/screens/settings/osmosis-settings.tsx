//osmosis settings screen
import { useTheme } from "@emotion/react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Platform } from "react-native";
import { View } from "react-native-animatable";
import { Switch } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { Setting } from ".";
import { useStore } from "../../../contexts";
import { isSmallScreenNumber } from "../../../helpers";
import { RootStackParamList, SettingsRoute } from "../../../router";
import { Back } from "../../back";
import { TextInput } from "../../text-input";
import { Text } from "../../typography";

export type OsmosisSettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  SettingsRoute.OsmosisSettings
>;

export const OsmosisSettingsScreen = observer<OsmosisSettingsScreenProps>(
  function OsmosisSettingsScreen({ navigation }) {
    const isObi = useStore().configStore.isObi();
    const theme = useTheme();
    const [sessionKeyEnabled, setSessionKeyEnabled] = useState<boolean>(false);
    const [spendLimit, setSpendLimit] = useState<string>("0");
    const [slippageLimit, setSlippageLimit] = useState<string>("0");
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
          <SessionKeySetting
            value={sessionKeyEnabled}
            onChange={() => setSessionKeyEnabled(!sessionKeyEnabled)}
          />
          <SessionKeySpendLimitSetting
            value={spendLimit}
            onChange={setSpendLimit}
          />
          <SlippageLimitSetting
            value={slippageLimit}
            onChange={setSlippageLimit}
          />
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
  value: string;
  onChange: (value: string) => void;
}

const SessionKeySpendLimitSetting = observer<SessionKeySpendLimitSettingProps>(
  function SessionKeySpendLimitSetting({ value, onChange }) {
    return (
      <Setting
        disableButton={true}
        title="Session Key Max Spend"
        subtitle="Any transaction up to this dollar amount won’t require a signature."
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "white" }}>$</Text>
          <TextInput
            inputStyle={{
              fontSize: 14,
              backgroundColor: "#1a1a1a",
              borderWidth: 0,
            }}
            style={Platform.OS === "web" ? { flex: 1, maxWidth: 100 } : {}}
            value={value}
            onChangeText={(text: string) => {
              console.log("text", text);
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
            value={value}
            style={{ maxWidth: 100, flex: 1 }}
            onChangeText={(text: string) => {
              const res = text.replace(/[^0-9./s]/g, "");
              onChange(res);
            }}
          />
          <Text style={{ fontSize: 16, color: "white" }}>%</Text>
        </View>
      </Setting>
    );
  }
);

interface SessionKeySettingProps {
  value: boolean;
  onChange: () => void;
}
const SessionKeySetting = observer<SessionKeySettingProps>(
  function SessionKeySetting({ value, onChange }) {
    const theme = useTheme();
    const isObi = useStore().configStore.isObi();
    return (
      <Setting
        disableButton={true}
        title="Session Key"
        subtitle="Enabling session key will only require you to sign one transaction when connecting your Osmosis smart account."
      >
        <Switch
          thumbColor="#437DFF"
          value={value}
          onValueChange={(value) => {
            onChange();
          }}
        />
      </Setting>
    );
  }
);
