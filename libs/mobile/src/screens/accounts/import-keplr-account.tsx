import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MnemonicKey } from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";
import invariant from "tiny-invariant";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";
import { OnboardingScreenContainer } from "../../app/screens/components/onboarding-screen-container";
import { useMultisigWallet } from "../../app/stores";
import { TextInput } from "../../app/text-input";

export type ImportKeplrAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportKeplrAccount
>;

export const ImportKeplrAccountScreen = observer<ImportKeplrAccountScreenProps>(
  function ImportKeplrAccountScreen({ navigation }) {
    const wallet = useMultisigWallet();
    const [mnemonic, setMnemonic] = useState("");

    return (
      <OnboardingScreenContainer>
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
        <View style={{ paddingVertical: 20 }}>
          <Button
            flavor="obi"
            onPress={() => {
              const key = new MnemonicKey({
                mnemonic,
                coinType: 118,
              });

              const publicKey = key.publicKey?.toAmino();
              invariant(
                publicKey && publicKey.type === "tendermint/PubKeySecp256k1",
                'Expected key to be of type "tendermint/PubKeySecp256k1"'
              );

              wallet.addSinglesigAccount({
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
      </OnboardingScreenContainer>
    );
  }
);
