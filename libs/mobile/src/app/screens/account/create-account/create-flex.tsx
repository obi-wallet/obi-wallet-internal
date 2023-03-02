import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { Avatar } from ".";
import { Button } from "../../../button";
import { TextInput } from "../../../text-input";
import { OnboardingScreenContainer } from "../../components/onboarding-screen-container";

export const CreateFlexAccountScreen = observer(
  function CreateFlexAccountScreen() {
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
          <Button flavor="obi" label="Confirm" />
          <Button flavor="cancel" label="Go Back" />
        </View>
      </OnboardingScreenContainer>
    );
  }
);
