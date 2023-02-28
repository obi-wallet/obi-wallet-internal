import {
  Chain,
  cosmos,
  GatekeeperConfig,
  generateSec256k1KeyPair,
  terra,
  Text,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Avatar } from "./avatar";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { Button } from "../../app/button";
import { OnboardingScreenContainer } from "../../app/screens/components/onboarding-screen-container";
import { useMultisigWallet, useStore } from "../../app/stores";
import { TextInput } from "../../app/text-input";

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

    const [name, setName] = useState("");

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
            Create Flex Account
          </Text>
          <Avatar />
          <TextInput
            placeholder="Enter Name"
            label="Flex Account Name"
            style={{ width: "100%", marginTop: 40 }}
            value={name}
            onChangeText={setName}
          />

          <Text style={{ fontSize: 14, color: "white", marginTop: 20 }}>
            Name your new flex account. You will be able to change flex account
            settings from the Accounts tab once it is created.
          </Text>
        </View>
        <View style={{ paddingVertical: 20 }}>
          <Button
            flavor="obi"
            onPress={() => {
              const { publicKey, privateKey } = generateSec256k1KeyPair();
              const aminoPublicKey = {
                type: "tendermint/PubKeySecp256k1" as const,
                value: publicKey,
              };

              const address = Chain.select({
                chainId: wallet.chain,
                onCosmosChain(chainId) {
                  return cosmos.getAddress({
                    chainId,
                    publicKey: aminoPublicKey,
                  });
                },
                onTerraChain() {
                  return terra.getAddress({
                    publicKey: aminoPublicKey,
                  });
                },
              });

              gatekeeperConfig.value.flexAccounts.add({
                entity: {
                  meta: {
                    icon: "",
                    name,
                  },
                  address,
                  autoSign: null,
                  spendLimit: null,
                  privateKey: privateKey,
                  publicKey: aminoPublicKey,
                },
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

    // return (
    //   <View style={{ marginTop: 100 }}>
    //     <Button
    //       flavor="blue"
    //       label="Create Flex Account"
    //       onPress={() => {
    //         gatekeeperConfig.value.flexAccounts.add({
    //           entity: {
    //             meta: {
    //               icon: "",
    //               name: "name",
    //             },
    //             address: "0x123",
    //             autoSign: null,
    //             spendLimit: null,
    //             privateKey: "123",
    //             publicKey: {
    //               type: "tendermint/PubKeySecp256k1",
    //               value: "123",
    //             },
    //           },
    //         });
    //
    //         navigation.navigate(AccountsRoute.AccountsOverview);
    //       }}
    //     />
    //   </View>
    // );
  }
);
