import { zodResolver } from "@hookform/resolvers/zod";
import { MultisigKey } from "@obi-wallet/sdk";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";
import secp256k1 from "secp256k1";
import { z } from "zod";

import { EmailContainer } from "./container";
import { findRecoveryLink, isPrivateKey } from "./helpers";
import { EmailTab, EmailTabs } from "./tabs";
import { useStore } from "../../../../contexts";
import { isSmallScreenNumber } from "../../../../helpers";
import { useKeyboardVisible } from "../../../../hooks";
import {
  KeyFlow,
  OnboardingRoute,
  OnboardingStackParamList,
  RecoverFrom,
} from "../../../../router";
import { TextInput } from "../../../text-input";
import { Text } from "../../../typography";
import { VerifyAndProceedButton } from "../../../verify-and-proceed-button";
import invariant from "tiny-invariant";

export type EmailRecoveryScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.EmailRecovery
>;

export const EmailRecoveryScreen = observer<EmailRecoveryScreenProps>(
  function EmailRecoveryScreen({ route, navigation }) {
    const { params } = route;
    const isFocused = useIsFocused();
    if (!isFocused) return null;

    return (
      <EmailRecovery
        {...params}
        onSubmit={() => {
          navigation.navigate(OnboardingRoute.LookupProxyWallets, {
            ...params,
            recoverFrom: RecoverFrom.Email,
            walletsFound: [],
          });
        }}
      />
    );
  },
);

export interface EmailRecoveryProps {
  draftId: string;
  flow: KeyFlow;
  onSubmit(): void;
}

const schema = z.object({
  recoveryLink: z.string(),
});

export const EmailRecovery = observer<EmailRecoveryProps>(
  function EmailRecovery({ draftId, flow, onSubmit }) {
    const { draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: draftId });
    const [selectedTab, setSelectedTab] = useState(EmailTab.EmailKeyV1);

    const isKeyboardVisible = useKeyboardVisible();

    const { control, handleSubmit, formState } = useForm({
      resolver: zodResolver(schema),
      mode: "onChange",
    });

    function renderTabContent() {
      return (
        <>
          <Text
            style={{
              color: "#fff",
              fontSize: isSmallScreenNumber(12, 14),
              marginTop: 10,
            }}
          >
            <FormattedMessage
              id="onboarding5.recovery.emailsubtext.cosmos"
              defaultMessage="Paste in your recovery link from your email. (This is one-time use and will be replaced with a new recovery key.)"
            />
          </Text>
          <Controller
            name="recoveryLink"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => {
              return (
                <TextInput
                  placeholder="E-Mail Key"
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
                    onChange(text);
                  }}
                />
              );
            }}
          />
        </>
      );
    }
    return (
      <EmailContainer>
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

        <EmailTabs
          selectedTab={selectedTab}
          flow={flow}
          isObi={true}
          onPress={setSelectedTab}
        >
          {renderTabContent()}
        </EmailTabs>

        <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}>
          {!isKeyboardVisible && (
            <VerifyAndProceedButton
              disabled={false}
              onPress={handleSubmit(async (data) => {
                console.log("calling /api/recover/email...");
                const response = await fetch("/api/recover/email", {
                  method: "POST",
                  body: JSON.stringify({
                    recoveryLink: data.recoveryLink,
                  }),
                });
                const res = await response.json();
                console.log("response:" + JSON.stringify(res));

                invariant(res.decrypted, "unable to recover key");

                const publicKey = Buffer.from(
                  secp256k1.publicKeyCreate(
                    new Uint8Array(Buffer.from(res.decrypted, "base64")),
                  ),
                ).toString("base64");

                draft.value.setEmailRecoveryKey({
                  publicKey: {
                    type: "tendermint/PubKeySecp256k1",
                    value: publicKey,
                  },
                  privateKey: res.decrypted,
                });

                onSubmit();
                return;
              })}
            />
          )}
        </View>
      </EmailContainer>
    );
  },
);
