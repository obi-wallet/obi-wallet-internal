import { Text } from "@obi-wallet/common";
import { TextInput } from "@obi-wallet/mobile";
import { useState, FC } from "react";
import { View, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";
import { Button } from "../../../button";
import { OnboardingScreenContainer } from "../../components/onboarding-screen-container";

import KeplrIcon from "../assets/keplr.svg";
import StationIcon from "../assets/station.svg";
import { SvgProps } from "react-native-svg";

export const AddLegacyAccountScreen = () => {
  //accountType state
  const [accountType, setAccountType] = useState<string | null>(null);

  const getAccountTypeText = () => {
    switch (accountType) {
      case "Keplr": {
        return (
          <>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                marginBottom: 15,
                fontWeight: "bold",
              }}
            >
              Import Keplr Account
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "white",
                textAlign: "center",
              }}
            >
              Import a traditional, seed phrase account from{" "}
              <Text style={{ fontWeight: "bold" }}>Keplr</Text> to use in the
              Obi interface. Multi-Key and other functionality is not available
              for this account type.
            </Text>
          </>
        );
      }
      case "Station": {
        return (
          <>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                marginBottom: 15,
                fontWeight: "bold",
              }}
            >
              Import Station Account
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "white",
                textAlign: "center",
              }}
            >
              Import a traditional, seed phrase account from{" "}
              <Text style={{ fontWeight: "bold" }}>Station</Text> to use in the
              Obi interface. Multi-Key and other functionality is not available
              for this account type.
            </Text>
          </>
        );
      }
      default:
        return (
          <>
            <Text style={{ fontSize: 14, color: "white" }}>
              Select which type of account you would like to import
            </Text>
          </>
        );
    }
  };
  return (
    <OnboardingScreenContainer back={false}>
      <ScrollView
        style={{
          flex: 1,

          marginTop: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, marginBottom: 15 }}>
          Choose Account Type
        </Text>
        <AccountSelector
          selected={accountType}
          onSelected={(accountType) => setAccountType(accountType)}
        />
        {getAccountTypeText()}
        {accountType && (
          <>
            <TextInput
              label={`${accountType} Account Name`}
              style={{ width: "100%", marginTop: 20 }}
            />
            <TextInput
              label={`${accountType} Seed Phrase`}
              style={{ width: "100%", marginTop: 20 }}
            />
          </>
        )}
      </ScrollView>
      <View style={{ paddingVertical: 20 }}>
        <Button flavor="obi" onPress={() => {}} label="Confirm" />
        <Button flavor="cancel" onPress={() => {}} label="Go Back" />
      </View>
    </OnboardingScreenContainer>
  );
};

const AccountSelector = ({
  selected,
  onSelected,
}: {
  selected: string | null;
  onSelected: (account: string) => void;
}) => {
  const accounts = [
    {
      name: "Keplr",
      // image: require("../assets/keplr.svg"),
      Image: KeplrIcon,
    },
    {
      name: "Station",
      // image: require ( "../assets/station.svg"),
      Image: StationIcon,
    },
  ];
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      {accounts.map((account) => (
        <AccountElement
          Image={account.Image}
          selected={selected === account.name}
          onPress={() => onSelected(account.name)}
          key={account.name}
        />
      ))}
    </View>
  );
};
const AccountElement = ({
  Image,
  selected,
  onPress,
}: {
  Image: FC<SvgProps>;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={{
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: selected ? "#2D2D2D" : "#1D1D1D",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: selected ? 2 : 0,
        borderColor: "white",
        margin: 10,
      }}
      onPress={() => onPress()}
    >
      <Image />
    </TouchableOpacity>
  );
};
