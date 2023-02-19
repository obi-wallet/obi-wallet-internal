import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";

export type ImportKeplrAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportKeplrAccount
>;

export const ImportKeplrAccountScreen = observer<ImportKeplrAccountScreenProps>(
  function ImportKeplrAccountScreen({ navigation }) {
    return (
      <View style={{ marginTop: 100 }}>
        <Button
          flavor="blue"
          label="Import Keplr Account"
          onPress={() => {
            navigation.navigate(AccountsRoute.AccountsOverview);
          }}
        />
      </View>
    );
  }
);
