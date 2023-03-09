import { GatekeeperConfig, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import BeneficiaryAccountIcon from "./assets/beneficiary-account-icon.svg";
import { AvatarPicker, Icon } from "./avatar";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { Button } from "../../app/button";
import { ScreenContainer } from "../../app/screens/components/screen-container";
import { isSmallScreenNumber } from "../../app/screens/components/screen-size";
import { useMultisigWallet, useStore } from "../../app/stores";
import { TextInput } from "../../app/text-input";
import { useKeyboardVisible } from "../../helpers/keyboard-visible";

export type CreateBeneficiaryAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateBeneficiaryAccount
>;

// TODO: validate form
export const CreateBeneficiaryAccountScreen =
  observer<CreateBeneficiaryAccountScreenProps>(
    function CreateBeneficiaryAccountScreen({ navigation }) {
      const { draftsStore } = useStore();
      const wallet = useMultisigWallet();
      const keyboardVisible = useKeyboardVisible();
      const isAndroid = Platform.OS === "android";
      const gatekeeperConfig = draftsStore.get<GatekeeperConfig>({
        id: getGatekeeperConfigDraftId(wallet),
      });
      const [icon, setIcon] = useState<Icon | null>(null);

      const [name, setName] = useState("");
      // TODO: validate address
      const [address, setAddress] = useState("");

      return (
        <ScreenContainer>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flex: 1 }}
            enableOnAndroid={false}
          >
            <View
              style={{
                flex: 1,
                alignItems: "flex-start",
                marginTop: 20,
              }}
            >
              <View
                style={{
                  alignItems: "center",

                  width: "100%",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, marginBottom: 15 }}
                >
                  Add Inheritance Account
                </Text>
                <AvatarPicker
                  FallbackSvg={BeneficiaryAccountIcon}
                  icon={icon}
                  onChange={setIcon}
                />
              </View>
              <TextInput
                placeholder="Enter Name"
                label="Inheritance Account Name"
                style={{ width: "100%", marginTop: 40 }}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                placeholder="Enter Address"
                label="Beneficiary Address"
                style={{ width: "100%", marginTop: 10 }}
                value={address}
                onChangeText={setAddress}
              />

              <Text
                style={{
                  fontSize: isSmallScreenNumber(12, 14),
                  color: "white",
                  marginTop: 20,
                  textAlign: "left",
                }}
              >
                Enter a name and the address of your beneficiary. If they don't
                have an address, they can create an account using Obi or any
                other [blockchain] wallet.
              </Text>

              <Text
                style={{
                  fontSize: isSmallScreenNumber(12, 14),
                  color: "white",
                  marginTop: 20,
                  textAlign: "left",
                }}
              >
                NOTE: If user is not using an Obi interface, they won't be able
                to see the balance of the funds they inherited.
              </Text>
            </View>
            {isAndroid && !keyboardVisible && (
              <View style={{ marginTop: 20 }}>
                <Button
                  flavor="blue"
                  disabled={!name || !address}
                  onPress={() => {
                    gatekeeperConfig.value.addBeneficiary({
                      type: "beneficiary",
                      meta: {
                        icon: icon?.uri || "",
                        name,
                      },
                      address,
                      dormancyThreshold: {
                        years: 1,
                      },
                      dripSchedule: {
                        rate: 0.01,
                        period: {
                          months: 1,
                        },
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
            )}
          </KeyboardAwareScrollView>
        </ScreenContainer>
      );
    }
  );
