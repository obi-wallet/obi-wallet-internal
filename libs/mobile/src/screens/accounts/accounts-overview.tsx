import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";
import { useMultisigWallet } from "../../app/stores";

export type AccountsOverviewScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AccountsOverview
>;

export const AccountsOverviewScreen = observer<AccountsOverviewScreenProps>(
  function AccountsOverviewScreen({ navigation }) {
    const wallet = useMultisigWallet();

    // TODO: accounts should accept draft instead

    return (
      <View style={{ marginTop: 100 }}>
        <Text>{JSON.stringify(wallet.accounts, null, 2)}</Text>
        <Button
          flavor="blue"
          label="Add"
          onPress={() => {
            navigation.navigate(AccountsRoute.AddAccount);
          }}
        />
      </View>
    );
  }
);
