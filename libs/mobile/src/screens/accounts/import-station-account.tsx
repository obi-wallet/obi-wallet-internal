import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";
import { useMultisigWallet } from "../../app/stores";

export type ImportStationAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportStationAccount
>;

export const ImportStationAccountScreen =
  observer<ImportStationAccountScreenProps>(
    function ImportStationAccountScreen({ navigation }) {
      const wallet = useMultisigWallet();

      return (
        <View style={{ marginTop: 100 }}>
          <Button
            flavor="blue"
            label="Import Station Account"
            onPress={() => {
              wallet.addSinglesigAccount({
                publicKey: {
                  type: "tendermint/PubKeySecp256k1",
                  value: "123",
                },
                privateKey: "123",
              });

              navigation.navigate(AccountsRoute.AccountsOverview);
            }}
          />
        </View>
      );
    }
  );
