import { Text } from "@obi-wallet/common";
import { TextInput } from "@obi-wallet/mobile";
import { View } from "react-native";
import { Button } from "../../../button";
import { OnboardingScreenContainer } from "../../components/onboarding-screen-container";
import { Avatar } from "./index";

export const CreateFlexAccountScreen = () => {
  return (
    <OnboardingScreenContainer back={false}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, marginBottom: 15 }}>
          Create Flex Account
        </Text>
        <Avatar />
        <TextInput
          placeholder="Enter Name"
          label="Flex Account Name"
          style={{ width: "100%", marginTop: 40 }}
        />

        <Text style={{ fontSize: 14, color: "white", marginTop: 20 }}>
          Name your new flex account. You will be able to change flex account
          settings from the Accounts tab once it is created.
        </Text>
      </View>
      <View style={{ paddingVertical: 20 }}>
        <Button flavor="obi" onPress={() => {}} label="Confirm" />
        <Button flavor="cancel" onPress={() => {}} label="Go Back" />
      </View>
    </OnboardingScreenContainer>
  );
};
