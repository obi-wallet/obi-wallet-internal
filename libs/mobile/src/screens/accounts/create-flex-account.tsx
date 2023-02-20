import { GatekeeperConfig } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { Button } from "../../app/button";
import { useMultisigWallet, useStore } from "../../app/stores";

export type CreateFlexAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateFlexAccount
>;

export const CreateFlexAccountScreen = observer<CreateFlexAccountScreenProps>(
  function CreateFlexAccountScreen({ navigation }) {
    const { draftsStore } = useStore();
    const wallet = useMultisigWallet();
    const gatekeeperConfig = draftsStore.get<GatekeeperConfig>({
      id: getGatekeeperConfigDraftId(wallet),
    });

    return (
      <View style={{ marginTop: 100 }}>
        <Button
          flavor="blue"
          label="Create Flex Account"
          onPress={() => {
            gatekeeperConfig.value.flexAccounts.add({
              entity: {
                meta: {
                  icon: "",
                  name: "name",
                },
                address: "0x123",
                autoSign: null,
                spendLimit: null,
                privateKey: "123",
                publicKey: {
                  type: "tendermint/PubKeySecp256k1",
                  value: "123",
                },
              },
            });

            navigation.navigate(AccountsRoute.AccountsOverview);
          }}
        />
      </View>
    );
  }
);
