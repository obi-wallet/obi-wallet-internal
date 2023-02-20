import { GatekeeperConfig, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { Button } from "../../app/button";
import { useMultisigWallet, useStore } from "../../app/stores";

export type AccountsOverviewScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AccountsOverview
>;

export const AccountsOverviewScreen = observer<AccountsOverviewScreenProps>(
  function AccountsOverviewScreen({ navigation }) {
    const { draftsStore } = useStore();
    const wallet = useMultisigWallet();

    const draftId = getGatekeeperConfigDraftId(wallet);
    const draft = draftsStore.get<GatekeeperConfig>({
      id: draftId,
    });

    const accounts = wallet.getAccounts(draft.value);
    console.log(accounts);

    return (
      <View style={{ marginTop: 100 }}>
        <Text>{JSON.stringify(accounts, null, 2)}</Text>
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
