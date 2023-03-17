import { GatekeeperConfig, Text } from "@obi-wallet/common";
import { generateSec256k1KeyPair, Sdk } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import FlexAccountIcon from "./assets/flex-account-icon.svg";
import { AvatarPicker, Icon } from "./avatar";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { Button } from "../../app/button";
import { ScreenContainer } from "../../app/screens/components/screen-container";
import { useMultisigWallet, useStore } from "../../app/stores";
import { TextInput } from "../../app/text-input";

export type CreateFlexAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateFlexAccount
>;

// TODO: validate form
export const CreateFlexAccountScreen = observer<CreateFlexAccountScreenProps>(
  function CreateFlexAccountScreen({ navigation }) {
    const { draftsStore } = useStore();
    const wallet = useMultisigWallet();
    const gatekeeperConfig = draftsStore.get<GatekeeperConfig>({
      id: getGatekeeperConfigDraftId(wallet),
    });
    const [icon, setIcon] = useState<Icon | null>(null);
    const [name, setName] = useState("");
    return (
      <ScreenContainer>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, marginBottom: 15 }}>
              Create Flex Account
            </Text>
            <AvatarPicker
              icon={icon}
              onChange={setIcon}
              FallbackSvg={FlexAccountIcon}
            />
            <TextInput
              placeholder="Enter Name"
              label="Flex Account Name"
              style={{ width: "100%", marginTop: 40 }}
              value={name}
              onChangeText={setName}
            />

            <Text style={{ fontSize: 14, color: "white", marginTop: 20 }}>
              Name your new flex account. You will be able to change flex
              account settings from the Accounts tab once it is created.
            </Text>
          </View>
        </KeyboardAwareScrollView>
        <View style={{ marginTop: 20 }}>
          <Button
            flavor="blue"
            disabled={!name}
            onPress={() => {
              const { publicKey, privateKey } = generateSec256k1KeyPair();
              const address = Sdk.chainId(wallet.chain).getAddressOfPublicKey({
                publicKey,
              });
              gatekeeperConfig.value.set(
                gatekeeperConfig.value.get().upsertFlexAccount({
                  type: "flex-account",
                  meta: {
                    icon: icon?.uri || "",
                    name,
                  },
                  address,
                  autoSign: null,
                  spendLimit: null,
                  privateKey,
                  publicKey,
                })
              );

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
