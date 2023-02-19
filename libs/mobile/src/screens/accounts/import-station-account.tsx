import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";

export type ImportStationAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportStationAccount
>;

export const ImportStationAccountScreen =
  observer<ImportStationAccountScreenProps>(
    function ImportStationAccountScreen({ navigation }) {
      return (
        <View style={{ marginTop: 100 }}>
          <Button
            flavor="blue"
            label="Import Station Account"
            onPress={() => {
              navigation.navigate(AccountsRoute.AccountsOverview);
            }}
          />
        </View>
      );
    }
  );
