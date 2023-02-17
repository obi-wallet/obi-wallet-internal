import { Text } from "@obi-wallet/common";
import { useState } from "react";
import { Touchable, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button } from "../../../button";
import { OnboardingScreenContainer } from "../../components/onboarding-screen-container";

const data = [
  {
    id: 1,
    name: "Flex Account",
    title: "Create Flex Account",
    description:
      "Create a permission account that can act on behalf of your Obi parent account. This option is recommended for most users.",
  },
  {
    id: 2,
    name: "Add Beneficiary",
    title: "Add Beneficiary",
    description:
      "Add a beneficiary account to your Obi parent account that will automatically receive your assets based on your configuration.",
  },
  {
    id: 3,
    name: "Legacy Account",
    title: "Import Legacy Account",
    description:
      "Import a traditional, seed phrase account from Station or Keplr to use in the Obi interface. Note: Multi-Key and other functionality is not available for this account type.",
  },
];

export const CreateAccountScreen = () => {
  const [selected, setSelected] = useState(1);
  const selectedItem = data.find((item) => item.id === selected);

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
          Create Account
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          {data.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                width: 95,
                height: 95,
                borderRadius: 16,
                borderWidth: selected === item.id ? 1 : 0,
                borderColor: "white",
                backgroundColor: "#272727",
              }}
              onPress={() => {
                console.log("pressed");
                setSelected(item.id);
              }}
            />
          ))}
        </View>
        <Text
          style={{
            marginVertical: 15,
            fontSize: 20,
            color: "white",
            fontWeight: "bold",
          }}
        >
          {selectedItem?.title}
        </Text>
        <Text style={{ fontSize: 14, color: "white" }}>
          {selectedItem?.description}
        </Text>
      </View>
      <View style={{ paddingVertical: 20 }}>
        <Button flavor="obi" onPress={() => {}} label="Confirm" />
        <Button flavor="cancel" onPress={() => {}} label="Go Back" />
      </View>
    </OnboardingScreenContainer>
  );
};

export * from "./create-flex";
export * from "./add-beneficiary";
export * from "./add-legacy-account";
export const Avatar = () => {
  return (
    <View
      style={{
        width: 95,
        height: 95,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "white",
        backgroundColor: "#272727",
      }}
    >
      <TouchableOpacity
        style={{
          width: 20,
          height: 20,
          backgroundColor: "white",
          position: "absolute",
          right: 5,
          top: 5,
        }}
        onPress={() => {}}
      />
    </View>
  );
};
