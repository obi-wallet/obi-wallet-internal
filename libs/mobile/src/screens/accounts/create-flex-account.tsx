import { zodResolver } from "@hookform/resolvers/zod";
import {
  AccountsRoute,
  AccountsStackParamList,
  AvatarPicker,
  Button,
  Icon,
  ScreenContainer,
  Text,
  TextInput,
  useStore,
} from "@obi-wallet/common";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import {
  GatekeeperConfig,
  generateSec256k1KeyPair,
  ObservableFlexAccount,
  Sdk,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { z } from "zod";

import FlexAccountIcon from "./assets/flex-account-icon.svg";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { nonEmptyString } from "../../helpers/validation-helpers";

export type CreateFlexAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateFlexAccount
>;

export const CreateFlexAccountScreen = observer<CreateFlexAccountScreenProps>(
  function CreateFlexAccountScreen({ navigation }) {
    const { draftsStore } = useStore();
    const wallet = useCurrentWallet();
    const gatekeeperConfig = draftsStore.get<GatekeeperConfig>({
      id: getGatekeeperConfigDraftId(wallet),
    });
    const schema = z.object({
      name: nonEmptyString("Name"),
    });
    const { control, handleSubmit, formState } = useForm({
      defaultValues: {
        name: "",
      },
      mode: "onTouched",
      resolver: zodResolver(schema),
    });
    const [icon, setIcon] = useState<Icon | null>(null);
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
            <Controller
              name="name"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Enter Name"
                  label="Flex Account Name"
                  style={{ width: "100%", marginTop: 40 }}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  maxLength={30}
                  invalidMessage={formState.errors.name?.message}
                />
              )}
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
            disabled={!formState.isValid}
            onPress={handleSubmit((data) => {
              const { publicKey, privateKey } = generateSec256k1KeyPair();
              const address = Sdk.chainId(
                wallet.chainId
              ).transactions.getAddressOfPublicKey(publicKey);
              gatekeeperConfig.value.upsertFlexAccount(
                ObservableFlexAccount.create({
                  type: "flex-account",
                  meta: {
                    icon: icon?.uri || "",
                    name: data.name,
                  },
                  address,
                  autoSign: null,
                  spendLimit: null,
                  privateKey,
                  publicKey,
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
  }
);
