import { Text } from "@obi-wallet/common";
import { KeyType } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { KeysList } from "../../app/screens/components/keys-list";
import { OnboardingScreenContainer } from "../../app/screens/components/onboarding-screen-container";
import { isSmallScreenNumber } from "../../app/screens/components/screen-size";
import {
  OnboardingRoute,
  OnboardingStackParamList,
  RecoverFrom,
} from "../../app/screens/onboarding/onboarding-stack";
import { useStore } from "../../app/stores";
import { KeyRoute } from "../keys";

export type SelectMethodScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.SelectMethod
>;

export const SelectMethodScreen = observer<SelectMethodScreenProps>(
  function SelectMethodScreen({ route, navigation }) {
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
                    navigation.navigate(KeyRoute.PhoneKeyRequest, {
                      ...params,
                      RecoverFrom: RecoverFrom.Phone,
                    });
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
  }
);
