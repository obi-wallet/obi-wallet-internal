import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";
import { ScreenContainer } from "../../app/screens/components/screen-container";

export type AddAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AddAccount
>;

enum AccountType {
  FlexAccount = "flex-account",
  Beneficiary = "beneficiary",
  Legacy = "legacy",
}

const accountTypeMetaData: Record<
  AccountType,
  { title: string; description: string; route: AccountsRoute }
> = {
  [AccountType.FlexAccount]: {
    title: "Create Flex Account",
    description:
      "Create a permission account that can act on behalf of your Obi parent account. This option is recommended for most users.",
    route: AccountsRoute.CreateFlexAccount,
  },
  [AccountType.Beneficiary]: {
    title: "Add Beneficiary",
    description:
      "Add a beneficiary account to your Obi parent account that will automatically receive your assets based on your configuration.",
    route: AccountsRoute.CreateBeneficiaryAccount,
  },
  [AccountType.Legacy]: {
    title: "Import Legacy Account",
    description:
      "Import a traditional, seed phrase account from Station or Keplr to use in the Obi interface. Note: Multi-Key and other functionality is not available for this account type.",
    route: AccountsRoute.ImportLegacyAccount,
  },
};

export const AddAccountScreen = observer<AddAccountScreenProps>(
  function AddAccountScreen({ navigation }) {
    const accountTypes = [
      AccountType.FlexAccount,
      AccountType.Beneficiary,
      AccountType.Legacy,
    ];
    const [selected, setSelected] = useState<AccountType>(accountTypes[0]);
    const selectedItem = accountTypeMetaData[selected];

    return (
      <ScreenContainer>
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
            {accountTypes.map((item) => (
              <TouchableOpacity
                key={item}
                style={{
                  width: 95,
                  height: 95,
                  borderRadius: 16,
                  borderWidth: selected === item ? 1 : 0,
                  borderColor: "white",
                  backgroundColor: "#272727",
                }}
                onPress={() => {
                  setSelected(item);
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
            {selectedItem.title}
          </Text>
          <Text style={{ fontSize: 14, color: "white" }}>
            {selectedItem.description}
          </Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <Button
            flavor="obi"
            onPress={() => {
              navigation.navigate(selectedItem.route);
            }}
            label="Confirm"
          />
          <Button
            flavor="cancel"
            onPress={() => {
              navigation.goBack();
            }}
            label="Cancel"
          />
        </View>
      </ScreenContainer>
    );
  }
);
