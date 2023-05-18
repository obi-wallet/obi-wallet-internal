import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  isSmallScreenNumber,
  Text,
  useStore,
} from "@obi-wallet/common";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { GatekeeperConfig, ObservableBeneficiary } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { z } from "zod";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import BeneficiaryAccountIcon from "./assets/beneficiary-account-icon.svg";
import { AvatarPicker, Icon } from "./avatar";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { ScreenContainer } from "../../app/screens/components/screen-container";
import { TextInput } from "../../app/text-input";
import { AddressController } from "../../forms";
import { useKeyboardVisible } from "../../helpers/keyboard-visible";
import { address, nonEmptyString } from "../../helpers/validation-helpers";

export type CreateBeneficiaryAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateBeneficiaryAccount
>;

export const CreateBeneficiaryAccountScreen =
  observer<CreateBeneficiaryAccountScreenProps>(
    function CreateBeneficiaryAccountScreen({ navigation }) {
      const { draftsStore } = useStore();
      const wallet = useCurrentWallet();
      const schema = z.object({
        name: nonEmptyString("Name"),
        address: address(wallet.chainId),
      });
      const { control, handleSubmit, formState } = useForm({
        defaultValues: {
          name: "",
          address: "",
        },
        mode: "onTouched",
        resolver: zodResolver(schema),
      });

      const keyboardVisible = useKeyboardVisible();
      const isAndroid = Platform.OS === "android";
      const gatekeeperConfig = draftsStore.get<GatekeeperConfig>({
        id: getGatekeeperConfigDraftId(wallet),
      });
      const [icon, setIcon] = useState<Icon | null>(null);

      return (
        <ScreenContainer>
          <KeyboardAwareScrollView
            viewIsInsideTabBar
            style={{
              flex: 1,
            }}
            contentContainerStyle={{
              alignItems: "stretch",
              marginTop: 20,
            }}
          >
            <View
              style={{
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 16, marginBottom: 15 }}>
                Add Inheritance Account
              </Text>
              <AvatarPicker
                FallbackSvg={BeneficiaryAccountIcon}
                icon={icon}
                onChange={setIcon}
              />
            </View>
            <View style={{ marginTop: 40 }}>
              <Controller
                name="name"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Enter Name"
                    label="Inheritance Account Name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    maxLength={30}
                    invalidMessage={formState.errors.name?.message}
                  />
                )}
              />
            </View>
            <View style={{ marginTop: 10 }}>
              <Controller
                name="address"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <AddressController
                      label="Beneficiary Address"
                      placeholder="Enter Address"
                      chainId={wallet.chainId}
                      field={field}
                      fieldState={fieldState}
                    />
                  );
                }}
              />
            </View>

            <Text
              style={{
                fontSize: isSmallScreenNumber(12, 14),
                color: "white",
                marginTop: 20,
                textAlign: "left",
              }}
            >
              Enter a name and the address of your beneficiary. If they don't
              have an address, they can create an account using Obi or any other{" "}
              {wallet.chain.label} wallet.
            </Text>

            <Text
              style={{
                fontSize: isSmallScreenNumber(12, 14),
                color: "white",
                marginTop: 20,
                textAlign: "left",
              }}
            >
              NOTE: If user is not using an Obi interface, they won't be able to
              see the balance of the funds they inherited.
            </Text>
          </KeyboardAwareScrollView>
          {isAndroid && keyboardVisible ? null : (
            <View style={{ marginTop: 20 }}>
              <Button
                flavor="blue"
                disabled={!formState.isValid}
                onPress={handleSubmit((data) => {
                  gatekeeperConfig.value.upsertBeneficiary(
                    ObservableBeneficiary.create({
                      type: "beneficiary",
                      meta: {
                        icon: icon?.uri || "",
                        name: data.name,
                      },
                      address: data.address,
                      dormancyThreshold: {
                        years: 1,
                      },
                      dripSchedule: {
                        rate: 0.01,
                        period: {
                          months: 1,
                        },
                      },
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
          )}
        </ScreenContainer>
      );
    }
  );
