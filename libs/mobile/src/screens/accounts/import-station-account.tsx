import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MnemonicKey } from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";
import invariant from "tiny-invariant";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";
import { ScreenContainer } from "../../app/screens/components/screen-container";
import { useMultisigWallet } from "../../app/stores";
import { TextInput } from "../../app/text-input";

export type ImportStationAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportStationAccount
>;

export const ImportStationAccountScreen =
  observer<ImportStationAccountScreenProps>(
    function ImportStationAccountScreen({ navigation }) {
      const wallet = useMultisigWallet();
      const [mnemonic, setMnemonic] = useState("");

      return (
        <ScreenContainer>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, marginBottom: 15 }}>
              Import Legacy Account
            </Text>
            <TextInput
              placeholder="Enter Seedphrase"
              label="Seedphrase"
              style={{ width: "100%", marginTop: 40 }}
              value={mnemonic}
              onChangeText={setMnemonic}
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <Button
              flavor="blue"
              onPress={() => {
                const key = new MnemonicKey({
                  mnemonic,
                });

                const publicKey = key.publicKey?.toAmino();
                invariant(
                  publicKey && publicKey.type === "tendermint/PubKeySecp256k1",
                  'Expected key to be of type "tendermint/PubKeySecp256k1"'
                );

                wallet.addSinglesigWallet({
                  type: "singlesig-wallet",
                  publicKey,
                  privateKey: key.privateKey.toString("base64"),
                });

                navigation.navigate(AccountsRoute.AccountsOverview);
              }}
              label="Confirm"
            />
            <Button
              flavor="cancel"
              onPress={() => {
                navigation.goBack();
              }}
              label="Cancel"
            />
          </View>
        </ScreenContainer>
      );
    }
  );
