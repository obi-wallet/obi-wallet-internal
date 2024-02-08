import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { useStore } from "../../../contexts";
import { AccountsRoute, AccountsStackParamList } from "../../../router";
import { Button } from "../../buttons";
import {
  BeneficiaryAccountIcon,
  FlexAccountIcon,
  LegacyAccountIcon,
} from "../../icons";
import { ScreenContainer } from "../../screen-container";
import { Text } from "../../typography";

export type AddAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AddAccount
>;
enum AccountType {
  FlexAccount = "flex-account",
  Beneficiary = "beneficiary",
  Legacy = "legacy",
}
const getAccountTypeIcon = (type: AccountType) => {
  switch (type) {
    case AccountType.FlexAccount:
      return <FlexAccountIcon />;
    case AccountType.Beneficiary:
      return <BeneficiaryAccountIcon />;
    case AccountType.Legacy:
      return <LegacyAccountIcon />;
  }
};

export const AddAccountScreen = observer<AddAccountScreenProps>(
  function AddAccountScreen({ navigation }) {
    const { chainStore } = useStore();
    const accountTypes = [
      AccountType.FlexAccount,
      AccountType.Beneficiary,
      AccountType.Legacy,
    ];
    const bip = chainStore.currentChainInformation.bip;
    const accountTypeMetaData = {
      [AccountType.FlexAccount]: {
        title: "Create Flex Account",
        description:
          "Create a permission account that can act on behalf of your Obi parent account. This option is recommended for most users.",
        route: [AccountsRoute.CreateFlexAccount] as const,
      },
      [AccountType.Beneficiary]: {
        title: "Add Inheritance Account",
        description:
          "Add an inheritance account to your Obi parent account that will automatically receive your assets based on your configuration.",
        route: [AccountsRoute.CreateBeneficiaryAccount] as const,
      },
      [AccountType.Legacy]: {
        title: "Import Legacy Account",
        description: `Import a traditional, seed phrase account from ${
          bip.length > 1 ? "Station or Keplr" : "Keplr"
        } to use in the Obi interface. Note: Multi-Key and other functionality is not available for this account type.`,
        route:
          bip.length > 1
            ? ([AccountsRoute.ImportLegacyAccount] as const)
            : ([
                AccountsRoute.ImportBipMnemonic,
                { path: bip[0].path },
              ] as const),
      },
    };
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
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  setSelected(item);
                }}
              >
                {getAccountTypeIcon(item)}
              </TouchableOpacity>
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
            flavor="primary"
            onPress={() => {
              navigation.navigate(...selectedItem.route);
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
  },
);
