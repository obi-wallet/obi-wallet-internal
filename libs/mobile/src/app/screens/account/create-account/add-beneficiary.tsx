import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { Avatar } from ".";
import { Button } from "../../../button";
import { TextInput } from "../../../text-input";
import { OnboardingScreenContainer } from "../../components/onboarding-screen-container";
import { isSmallScreenNumber } from "../../components/screen-size";

export const AddBeneficiaryAccountScreen = observer(
  function AddBeneficiaryAccountScreen() {
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
            Add Beneficiary
          </Text>
          <Avatar />
          <TextInput
            placeholder="Enter Name"
            label="Beneficiary Account Name"
            style={{ width: "100%", marginTop: 40 }}
          />
          <TextInput
            placeholder="Enter Name"
            label="Beneficiary Address"
            style={{ width: "100%", marginTop: 10 }}
          />

          <Text
            style={{
              fontSize: isSmallScreenNumber(12, 14),
              color: "white",
              marginTop: 20,
              textAlign: "justify",
            }}
          >
            Enter a name and the address of your beneficiary. If they don’t have
            an address, they can create an account using Obi or any other
            [blockchain] wallet.
          </Text>

          <Text
            style={{
              fontSize: isSmallScreenNumber(12, 14),
              color: "white",
              marginTop: 20,
              textAlign: "justify",
            }}
          >
            NOTE: If user is not using an Obi interface, they won’t be able to
            see the balance of the funds they inherited.
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
