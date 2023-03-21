import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@obi-wallet/common";
import { ObservableSinglesigWallet } from "@obi-wallet/sdk";
import { MnemonicKey } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import invariant from "tiny-invariant";
import { z } from "zod";

import { AccountsRoute } from "./accounts-stack";
import { ImportKeplrAccountScreenProps } from "./import-keplr-account";
import { ImportStationAccountScreenProps } from "./import-station-account";
import { Button } from "../../app/button";
import { ScreenContainer } from "../../app/screens/components/screen-container";
import { useMultisigWallet } from "../../app/stores";
import { TextInput } from "../../app/text-input";
import { mnemonic } from "../../helpers/validation-helpers";

export const LegacyForm = observer<
  { coinType?: number } & (
    | ImportKeplrAccountScreenProps
    | ImportStationAccountScreenProps
  )
>(function LegacyForm({ navigation, coinType }) {
  const wallet = useMultisigWallet();
  const schema = z.object({
    mnemonic: mnemonic(),
  });
  const { control, handleSubmit, formState } = useForm({
    defaultValues: {
      mnemonic: "",
    },
    mode: "onTouched",
    resolver: zodResolver(schema),
  });
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
        <Controller
          name="mnemonic"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Enter Seedphrase"
              label="Seedphrase"
              style={{ width: "100%", marginTop: 40 }}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              invalidMessage={formState.errors.mnemonic?.message}
            />
          )}
        />
      </View>
      <View style={{ marginTop: 20 }}>
        <Button
          flavor="blue"
          disabled={!formState.isValid}
          onPress={handleSubmit((data) => {
            const key = new MnemonicKey({
              mnemonic: data.mnemonic,
              coinType,
            });

            const publicKey = key.publicKey?.toAmino();
            invariant(
              publicKey && publicKey.type === "tendermint/PubKeySecp256k1",
              'Expected key to be of type "tendermint/PubKeySecp256k1"'
            );

            wallet.upsertSinglesigWallet(
              ObservableSinglesigWallet.create({
                type: "singlesig-wallet",
                publicKey,
                privateKey: key.privateKey.toString("base64"),
              })
            );

            navigation.navigate(AccountsRoute.AccountsOverview);
          })}
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
});
