import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@obi-wallet/common";
import { ObservableGatekeeperConfig, Sdk } from "@obi-wallet/sdk";
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

const trim = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => String(val).trim(), schema);

export const CreateBeneficiaryAccountScreen =
  observer<CreateBeneficiaryAccountScreenProps>(
    function CreateBeneficiaryAccountScreen({ navigation }) {
      const { draftsStore } = useStore();
      const wallet = useMultisigWallet();
      const schema = z.object({
        name: trim(z.string().nonempty("Name cannot be empty")),
        address: trim(
          z
            .string()
            .nonempty("Address cannot be empty")
            .refine(
              (address) => {
                return Sdk.chainId(wallet.chainId).validateAddress({ address });
              },
              {
                message: "Invalid Address",
              }
            )
        ),
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
      const gatekeeperConfig = draftsStore.get<ObservableGatekeeperConfig>({
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
              <Text style={{ color: "white", fontSize: 16, marginBottom: 15 }}>
                Add Inheritance Account
              </Text>
              <AvatarPicker
                FallbackSvg={BeneficiaryAccountIcon}
                icon={icon}
                onChange={setIcon}
              />
            </View>
            <Controller
              name="name"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Enter Name"
                  label="Inheritance Account Name"
                  style={{ width: "100%", marginTop: 40 }}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  maxLength={30}
                  invalidMessage={formState.errors.name?.message}
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Enter Address"
                  label="Beneficiary Address"
                  style={{ width: "100%", marginTop: 10 }}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  invalidMessage={formState.errors.address?.message}
                />
              )}
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
                  gatekeeperConfig.value.upsertBeneficiary({
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
                  });

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
