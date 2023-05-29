import { KeyType } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { useStore } from "../../../contexts";
import { isSmallScreenNumber } from "../../../helpers";
import {
  OnboardingStackParamList,
  OnboardingRoute,
  KeyRoute,
} from "../../../router";
import { KeysList } from "../../multisig-settings";
import { OnboardingScreenContainer } from "../../onboarding-screen-container";
import { Text } from "../../typography";

export type SelectRecoveryMethodScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.SelectRecoveryMethod
>;

export const SelectRecoveryMethodScreen =
  observer<SelectRecoveryMethodScreenProps>(function SelectRecoverMethodScreen({
    route,
    navigation,
  }) {
    const { configStore } = useStore();
    const isObi = configStore.isObi();

    const { params } = route;

    return (
      <OnboardingScreenContainer>
        <View
          style={{
            marginTop: isObi ? 10 : isSmallScreenNumber(10, 25),
            paddingTop: isSmallScreenNumber(0, 32),
            flex: 1,
          }}
        >
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: isSmallScreenNumber(20, 24),
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Recover Wallet
          </Text>
          <Text
            style={{
              color: isObi ? "white" : "#999CB6",
              fontSize: isSmallScreenNumber(12, 14),
            }}
          >
            Choose a method to recover your wallet.
          </Text>
          <View style={{ flex: 1, marginTop: 30 }}>
            <KeysList
              data={[
                {
                  type: KeyType.Phone,
                  onPress() {
                    navigation.navigate(KeyRoute.PhoneKeyRequest, params);
                  },
                },
                {
                  type: KeyType.Email,
                  onPress() {
                    navigation.navigate(OnboardingRoute.EmailRecovery, params);
                  },
                },
              ]}
              hideOtherKeys
            />
          </View>
        </View>
      </OnboardingScreenContainer>
    );
  });
