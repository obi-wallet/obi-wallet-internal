import { useTheme } from "@emotion/react";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { OnboardingScreenContainer } from "../../app/screens/components/onboarding-screen-container";
import {
  OnboardingRoute,
  OnboardingStackParamList,
  RecoverFrom,
} from "../../app/screens/onboarding/onboarding-stack";
import EmailKeyIcon from "../../components/multisig-settings/assets/email.svg";
import PhoneKeyIcon from "../../components/multisig-settings/assets/phone.svg";
import { KeyRoute } from "../keys/key-stack";

export type SelectMethodScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.SelectMethod
>;

export const SelectMethodScreen = observer<SelectMethodScreenProps>(
  function SelectMethodScreen({ route, navigation }) {
    const theme = useTheme();

    const { params } = route;

    return (
      <OnboardingScreenContainer>
        <Text
          style={{ color: "white", fontSize: theme.typography.title1.fontSize }}
        >
          Recover Wallet
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: theme.typography.caption1.fontSize,
          }}
        >
          Choose a method to recover your wallet
        </Text>
        <View style={{ flex: 1, marginTop: 30 }}>
          <TouchableOpacity
            style={{
              height: 59,
              width: "100%",
              backgroundColor: "#272727",
              marginBottom: 10,
              flexDirection: "row",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              navigation.navigate(OnboardingRoute.EmailRecovery, params);
            }}
          >
            <EmailKeyIcon
              fill="white"
              width={30}
              height={30}
              style={{ marginHorizontal: 20 }}
            />
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 14,
                fontWeight: "600",
                flex: 1,
              }}
            >
              Use email key
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: 59,
              width: "100%",
              backgroundColor: "#272727",
              marginBottom: 10,
              flexDirection: "row",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
            }}
            onPress={() => {
              navigation.navigate(KeyRoute.PhoneKeyRequest, {
                ...params,
                RecoverFrom: RecoverFrom.Phone,
              });
            }}
          >
            <PhoneKeyIcon
              fill="white"
              width={30}
              height={30}
              style={{ marginHorizontal: 20 }}
            />
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 14,
                fontWeight: "600",
                flex: 1,
              }}
            >
              Use phone key
            </Text>
          </TouchableOpacity>
        </View>
      </OnboardingScreenContainer>
    );
  }
);
