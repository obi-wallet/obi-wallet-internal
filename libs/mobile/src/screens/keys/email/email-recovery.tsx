import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@obi-wallet/common";
import { MultisigKey, Secp256k1KeyPair } from "@obi-wallet/sdk";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";
import secp256k1 from "secp256k1";
import { z } from "zod";

import { EmailContainer, EmailTypeTabs } from ".";
import {
  OnboardingRoute,
  OnboardingStackParamList,
  RecoverFrom,
  useRootNavigation,
  useStore,
} from "../../..";
import { VerifyAndProceedButton } from "../../../app/screens/components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../app/screens/components/screen-size";
import { TextInput } from "../../../app/text-input";
import { useKeyboardVisible } from "../../../helpers/keyboard-visible";
import { KeyFlow } from "../key-stack";

export type EmailRecoveryScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.EmailRecovery
>;

enum Tab {
  EmailKeyV1,
  EmailKeyZK,
}

export const EmailRecoveryScreen = observer<EmailRecoveryScreenProps>(
  function EmailRecoveryScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;
    const isFocused = useIsFocused();
    if (!isFocused) return null;

    return (
      <EmailRecovery
        {...params}
        onSubmit={() => {
          navigation.navigate(OnboardingRoute.LookupProxyWallets, {
            ...params,
            RecoverFrom: RecoverFrom.Email,
          });
        }}
      />
    );
  }
);

export interface EmailRecoveryProps {
  draftId: string;
  flow: KeyFlow;
  onSubmit(PrivateKey?: string, publicKey?: string): void;
}

const emailPrivateKeySchema = z.object({
  privateKey: z.string().regex(/[A-Za-z0-9+/=]+={0,2}/),
});

export const EmailRecovery = observer<EmailRecoveryProps>(
  function EmailRecovery({ draftId, flow, onSubmit }) {
    const { configStore, draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: draftId });
    const [selectedTab, setSelectedTab] = useState(Tab.EmailKeyV1);
    const isObi = configStore.isObi();
    const getPrivateKeyFromText = (text: string) => {
      return text.match(/[A-Za-z0-9+/=]{43}=/)?.[0];
    };
    const isKeyboardVisible = useKeyboardVisible();

    const { control, handleSubmit, formState, setValue, getValues } = useForm({
      resolver: zodResolver(emailPrivateKeySchema),
      mode: "onChange",
    });

    function renderTabContent() {
      return (
        <>
          <Text
            style={{
              color: isObi ? "#fff" : "#999CB6",
              fontSize: isSmallScreenNumber(12, 14),
              marginTop: 10,
            }}
          >
            <FormattedMessage
              id="onboarding5.recovery.emailsubtext.cosmos"
              defaultMessage="Enter your recovery key from your email. (This is one-time use and will be replaced with a new recovery key.)"
            />
          </Text>
          <Controller
            name="privateKey"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => {
              return (
                <TextInput
                  placeholder="Email key"
                  autoCapitalize="none"
                  inputMode="text"
                  style={{ marginTop: 25 }}
                  inputStyle={{
                    ...(formState.errors.privateKey
                      ? { borderColor: "red" }
                      : {}),
                  }}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const privateKey = getPrivateKeyFromText(text);
                    onChange(privateKey || text);
                  }}
                />
              );
            }}
          />
        </>
      );
    }
    return (
      <EmailContainer isObi={isObi}>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: isSmallScreenNumber(20, 24),
            fontWeight: "600",
            marginTop: isSmallScreenNumber(20, 32),
            textAlign: "center",
          }}
        >
          <FormattedMessage
            id="onboarding2.recovery.email"
            defaultMessage="Recover your Email Key"
          />
        </Text>

        <EmailTypeTabs
          selectedTab={selectedTab}
          flow={flow}
          isObi={isObi}
          onPress={setSelectedTab}
        >
          {renderTabContent()}
        </EmailTypeTabs>

        <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}>
          {!isKeyboardVisible && (
            <VerifyAndProceedButton
              disabled={!formState.isValid}
              onPress={handleSubmit(async (data) => {
                const privateKey: string =
                  data.privateKey.match(/[A-Za-z0-9+/=]{43}=/)[0];
                const pk = new Uint8Array(Buffer.from(privateKey, "base64"));
                const publicKey = Buffer.from(
                  secp256k1.publicKeyCreate(pk)
                ).toString("base64");

                draft.value.setEmailRecoveryKey({
                  publicKey: {
                    type: "tendermint/PubKeySecp256k1",
                    value: publicKey,
                  },
                  privateKey,
                });

                onSubmit(privateKey, publicKey);
                return;
              })}
            />
          )}
        </View>
      </EmailContainer>
    );
  }
);
