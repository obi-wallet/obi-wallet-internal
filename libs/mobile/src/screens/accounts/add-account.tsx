import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";

export type AddAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AddAccount
>;

export const AddAccountScreen = observer<AddAccountScreenProps>(
  function AddAccountScreen({ navigation }) {
    return (
      <View style={{ marginTop: 100 }}>
        <Button
          flavor="blue"
          label="Create Flex Account"
          onPress={() => {
            navigation.navigate(AccountsRoute.CreateFlexAccount);
          }}
        />
        <Button
          flavor="blue"
          label="Inheritance"
          onPress={() => {
            navigation.navigate(AccountsRoute.CreateBeneficiaryAccount);
          }}
        />
        <Button
          flavor="blue"
          label="Import Legacy Account"
          onPress={() => {
            navigation.navigate(AccountsRoute.ImportLegacyAccount);
          }}
        />
      </View>
    );
  }
);
