import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";

export type CreateBeneficiaryAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateBeneficiaryAccount
>;

export const CreateBeneficiaryAccountScreen =
  observer<CreateBeneficiaryAccountScreenProps>(
    function CreateBeneficiaryAccountScreen({ navigation }) {
      return (
        <View style={{ marginTop: 100 }}>
          <Button
            flavor="blue"
            label="Create Beneficiary Account"
            onPress={() => {
              navigation.navigate(AccountsRoute.AccountsOverview);
            }}
          />
        </View>
      );
    }
  );
