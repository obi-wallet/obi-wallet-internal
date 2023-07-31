import { useTheme } from "@emotion/react";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { AccountSettingComponent } from "@obi-wallet/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import {
  createContext,
  Dispatch,
  Reducer,
  ReducerAction,
  ReducerState,
  useContext,
  useReducer,
  useState,
} from "react";
import { TextStyle } from "react-native";
import { View } from "react-native-animatable";
import { Switch } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { Setting } from ".";
import { useStore } from "../../../contexts";
import { isSmallScreenNumber, isWeb, createSessionKey } from "../../../helpers";
import {
  RootStackParamList,
  SettingsRoute,
  useRootNavigation,
} from "../../../router";
import { Button } from "../../buttons";
import { OsmosisScreenContainer } from "../../osmosis-screen-container";
import { CustomTextInputProps, TextInput } from "../../text-input";
import { Text } from "../../typography";

export type OsmosisSettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  SettingsRoute.OsmosisSettings
>;

type OsmosisSettingsScreenState = {
  [AccountSettingComponent.MaxSpend]: string;
  [AccountSettingComponent.SlippageLimit]: string;
  [AccountSettingComponent.AutoStopLoss]: string;
  [AccountSettingComponent.WeeklyDca]: string;
};

type R = Reducer<
  OsmosisSettingsScreenState,
  {
    component: AccountSettingComponent;
    value: string;
  }
>;

const reducer: R = (state, action) => {
  return {
    ...state,
    [action.component]: action.value,
  };
};

const StateContext = createContext<
  [ReducerState<R>, Dispatch<ReducerAction<R>>]
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
>(null!);

export const OsmosisSettingsScreen = observer<OsmosisSettingsScreenProps>(
  function OsmosisSettingsScreen() {
    const wallet = useCurrentWallet();
    const theme = useTheme();
    const [sessionKeyEnabled, setSessionKeyEnabled] = useState<boolean>(false);
    const stateContextValue = useReducer(reducer, {
      [AccountSettingComponent.MaxSpend]: "0",
      [AccountSettingComponent.SlippageLimit]: "0",
      [AccountSettingComponent.AutoStopLoss]: "0",
      [AccountSettingComponent.WeeklyDca]: "0",
    });

    return (
      <StateContext.Provider value={stateContextValue}>
        <OsmosisScreenContainer>
          <SafeAreaView style={{ flex: 1 }}>
            <View
              style={{
                marginTop: 10,
                paddingTop: isSmallScreenNumber(0, 32),
                paddingBottom: 20,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  alignItems: "flex-start",
                  justifyContent: "center",
                  flex: 1,
                  paddingLeft: 25,
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
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: isSmallScreenNumber(14, 18),
                    opacity: 0.7,
                  }}
                >
                  Manage your Smart Account Settings.
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 20 }}>
              <SessionKeySetting
                value={sessionKeyEnabled}
                onChange={() => setSessionKeyEnabled(!sessionKeyEnabled)}
              />
              {theme.modal.accountSettings.map((component, i) => {
                return <AccountSetting component={component} key={i} />;
              })}
            </View>
            <View
              style={{
                margin: 5,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Button
                flavor="primary"
                label="Save Changes"
                buttonStyle={{ flex: 1, margin: 10 }}
                disabled={!sessionKeyEnabled}
                onPress={async () => {
                  const maxSpend = parseFloat(
                    stateContextValue[0][AccountSettingComponent.MaxSpend],
                  );
                  await createSessionKey({ wallet, maxSpend });
                }}
              />
            </View>
          </SafeAreaView>
        </OsmosisScreenContainer>
      </StateContext.Provider>
    );
  },
);

const AccountSetting = observer<{
  component: AccountSettingComponent;
}>(function AccountSetting({ component }) {
  switch (component) {
    case AccountSettingComponent.MaxSpend:
      return <SessionKeySpendLimitSetting />;
    case AccountSettingComponent.SlippageLimit:
      return <SlippageLimitSetting />;
    case AccountSettingComponent.WhitelistedLps:
      return <WhitelistedLPsSetting />;
    case AccountSettingComponent.AutoStopLoss:
      return <AutoStopLossSetting />;
    case AccountSettingComponent.WeeklyDca:
      return <WeeklyDcaSetting />;
    case AccountSettingComponent.VerifiedItems:
      return <VerifiedItemsSetting />;
  }
});

const SessionKeySpendLimitSetting = observer(
  function SessionKeySpendLimitSetting() {
    const { configStore } = useStore();
    const [_state, dispatch] = useContext(StateContext);
    const onChange = (value: string) => {
      dispatch({
        component: AccountSettingComponent.MaxSpend,
        value,
      });
    };
    const theme = useTheme();

    const denom = configStore.config.ethereumBalances ? "ZTX" : "OSMO";

    return (
      <Setting
        disableButton={true}
        title="Session Key Max Spend"
        subtitle={`Any transaction up to this ${denom} amount won't require a signature.`}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SettingsTextInput
            inputStyle={{
              backgroundColor:
                theme.settings?.textInputBackgroundColor ?? "#120F32",
            }}
            onChangeText={(text: string) => {
              const res = text.replace(/[^0-9.]/g, "");
              onChange(res);
            }}
          />
        </View>
      </Setting>
    );
  },
);
const SettingsTextInput = observer<CustomTextInputProps>(
  function SettingsTextInput(props) {
    const newProps = {
      ...props,
      inputStyle: {
        fontSize: 14,
        borderWidth: 0,
        padding: 0,
        textAlign: "center",
        ...(props.inputStyle as object),
      } as TextStyle,
      style: {
        height: 25,
        width: 60,
        ...(props.style as object),
      } as TextStyle,
    };

    return <TextInput {...newProps} />;
  },
);

const SlippageLimitSetting = observer(function SlippageLimitSetting() {
  const [state, dispatch] = useContext(StateContext);
  const value = state[AccountSettingComponent.SlippageLimit];
  const theme = useTheme();
  const onChange = (value: string) => {
    dispatch({
      component: AccountSettingComponent.SlippageLimit,
      value,
    });
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
        <SettingsTextInput
          inputStyle={{
            backgroundColor:
              theme.settings?.textInputBackgroundColor ?? "#120F32",
          }}
          maxLength={3}
          value={value}
          onChangeText={(text: string) => {
            const res = text.replace(/[^0-9./s]/g, "");
            onChange(res);
          }}
        />
        <Text
          style={{
            fontSize: 14,
            color: "white",
            position: "absolute",
            right: 5,
            zIndex: 2,
          }}
        >
          %
        </Text>
      </View>
    </Setting>
  );
});

const WhitelistedLPsSetting = observer(function WhitelistedLPsSetting() {
  const navigation = useRootNavigation();

  return (
    <Setting
      title="Whitelisted LPs"
      subtitle="Manage whitelisted LPs"
      onPress={() => navigation.navigate(SettingsRoute.WhitelistedLPs)}
    />
  );
});

const AutoStopLossSetting = observer(function AutoStopLossSetting() {
  const [state, dispatch] = useContext(StateContext);
  const value = state[AccountSettingComponent.AutoStopLoss];
  const theme = useTheme();
  const onChange = (value: string) => {
    dispatch({
      component: AccountSettingComponent.AutoStopLoss,
      value,
    });
  };

  return (
    <Setting
      disableButton={true}
      title="Auto Stop Loss"
      subtitle="Positions automatically open Stop Loss (SL) at this percentage loss."
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
        <SettingsTextInput
          inputStyle={{
            backgroundColor:
              theme.settings?.textInputBackgroundColor ?? "#120F32",
          }}
          value={value}
          onChangeText={(text: string) => {
            const res = text.replace(/[^0-9./s]/g, "");
            onChange(res);
          }}
        />
        <Text
          style={{
            fontSize: 14,
            color: "white",
            position: "absolute",
            right: 5,
            zIndex: 2,
          }}
        >
          %
        </Text>
      </View>
    </Setting>
  );
});

const WeeklyDcaSetting = observer(function WeeklyDcaSetting() {
  const [state, dispatch] = useContext(StateContext);
  const value = state[AccountSettingComponent.WeeklyDca];
  const theme = useTheme();
  const onChange = (value: string) => {
    dispatch({
      component: AccountSettingComponent.WeeklyDca,
      value,
    });
  };

  return (
    <Setting
      disableButton={true}
      title="Weekly DCA"
      subtitle="This amount will be added to your margin balance on a weekly basis. Powered by Kado."
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "white",
            position: "absolute",
            left: 5,
            zIndex: 2,
          }}
        >
          $
        </Text>

        <SettingsTextInput
          inputStyle={{
            backgroundColor:
              theme.settings?.textInputBackgroundColor ?? "#120F32",
          }}
          style={isWeb() ? { flex: 1, maxWidth: 100 } : {}}
          value={value}
          onChangeText={(text: string) => {
            const res = text.replace(/[^0-9.]/g, "");
            onChange(res);
          }}
        />
      </View>
    </Setting>
  );
});

interface SessionKeySettingProps {
  value: boolean;
  onChange: () => void;
}

const SessionKeySetting = observer<SessionKeySettingProps>(
  function SessionKeySetting({ value, onChange }) {
    const { configStore } = useStore();
    const theme = useTheme();
    const subtitle = configStore.config.ethereumBalances
      ? "Enabling session key will only require you to sign one transaction when connecting your ZTX smart account."
      : "Enabling session key will only require you to sign one transaction when connecting your Osmosis smart account.";

    return (
      <Setting disableButton={true} title="Session Key" subtitle={subtitle}>
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <Switch
            thumbColor={theme.colors.primary}
            trackColor={{
              false: theme.settings?.textInputBackgroundColor ?? "#120F32",
              true: theme.settings?.textInputBackgroundColor ?? "#120F32",
            }}
            style={{ height: 25, width: 60 }}
            value={value}
            onValueChange={() => {
              onChange();
            }}
          />
        </View>
      </Setting>
    );
  },
);

const VerifiedItemsSetting = observer(function SessionKeySetting() {
  const theme = useTheme();
  const subtitle =
    "Restrict transactions involving 3rd party or unverified items on the ZTX platform.";
  const [value, onChange] = useState(false);

  return (
    <Setting
      disableButton={true}
      title="Verified Items Only"
      subtitle={subtitle}
    >
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <Switch
          thumbColor={theme.colors.primary}
          trackColor={{
            false: theme.settings?.textInputBackgroundColor ?? "#120F32",
            true: theme.settings?.textInputBackgroundColor ?? "#120F32",
          }}
          style={{ height: 25, width: 60 }}
          value={value}
          onValueChange={(value) => {
            onChange(value);
          }}
        />
      </View>
    </Setting>
  );
});
