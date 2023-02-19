import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";

export type ImportLegacyAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportLegacyAccount
>;

export const ImportLegacyAccountScreen =
  observer<ImportLegacyAccountScreenProps>(function ImportLegacyAccountScreen({
    navigation,
  }) {
    return (
      <View style={{ marginTop: 100 }}>
        <Button
          flavor="blue"
          label="Import Station Account"
          onPress={() => {}}
        />
        <Button flavor="blue" label="Create Keplr Account" onPress={() => {}} />
      </View>
    );
  });
