import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";
import { useMultisigWallet } from "../../app/stores";

export type CreateFlexAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateFlexAccount
>;

export const CreateFlexAccountScreen = observer<CreateFlexAccountScreenProps>(
  function CreateFlexAccountScreen({ navigation }) {
    const wallet = useMultisigWallet();

    return (
      <View style={{ marginTop: 100 }}>
        <Button
          flavor="blue"
          label="Create Flex Account"
          onPress={() => {
            // TODO: use draft instead
            wallet.gatekeeperConfig.flexAccounts.add({
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
