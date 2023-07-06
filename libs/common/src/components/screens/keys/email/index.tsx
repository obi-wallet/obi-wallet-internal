import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStateEffect } from "@obi-wallet/headless-ui";
import {
  generateSec256k1KeyPair,
  MultisigKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { Linking, View } from "react-native";
import { z } from "zod";

import { EmailContainer } from "./container";
import { EmailTab, EmailTabs } from "./tabs";
import { useStore } from "../../../../contexts";
import { Alert, isSmallScreenNumber } from "../../../../helpers";
import { useKeyboardVisible } from "../../../../hooks";
import {
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  OnboardingRoute,
  SettingsRoute,
  useRootNavigation,
} from "../../../../router";
import { TextInput } from "../../../text-input";
import { Text } from "../../../typography";
import { VerifyAndProceedButton } from "../../../verify-and-proceed-button";

export { EmailRecoveryScreen } from "./recovery";
export type { EmailRecoveryScreenProps } from "./recovery";

export type EmailKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.EmailKey
>;

export const EmailKeyScreen = observer<EmailKeyScreenProps>(
  function EmailKeyScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    const isFocused = useIsFocused();
    if (!isFocused) return null;

    return (
      <EmailKey
        {...params}
        onSubmit={() => {
          switch (params.flow) {
            case KeyFlow.CreateWallet:
              navigation.navigate(OnboardingRoute.CreateWallet, params);
              break;
            case KeyFlow.RecoverWallet:
              navigation.navigate(OnboardingRoute.RecoverWallet, params);
              break;
            case KeyFlow.EditWallet:
              navigation.navigate(SettingsRoute.MultisigSettings);
              break;
          }
        }}
      />
    );
  }
);

export interface EmailKeyProps {
  draftId: string;
  flow: KeyFlow;
  onSubmit(): void;
}

const schema = z.object({
  email: z.string().email(),
});

export const EmailKey = observer<EmailKeyProps>(function EmailKey({
  draftId,
  flow,
  onSubmit,
}) {
  const { draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const [selectedTab, setSelectedTab] = useState(EmailTab.EmailKeyV1);
  const [emailKey, setEmailKey] = useState<Secp256k1PublicKey | undefined>();

  const onPressRef = useRef<() => void>();
  onPressRef.current = () => {
    if (emailKey) {
      draft.value.setEmailKey(emailKey);
      onSubmit();
    }
  };

  useAppStateEffect(
    (appState) => {
      if (appState === "active" && emailKey) {
        Alert.alert(
          "Confirm Email Sent",
          "Never enter the one-time key you received anywhere unless you need it for recovery. Have you sent the email to yourself?",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes, I sent the email to myself",
              onPress: onPressRef.current,
            },
          ],
          { cancelable: false }
        );
      }
    },
    [emailKey]
  );

  const isKeyboardVisible = useKeyboardVisible();

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  function encodeForMailto(text: string): string {
    return encodeURIComponent(text).replace(/%20/g, "%20");
  }

  function renderTabContent() {
    switch (selectedTab) {
      case EmailTab.EmailKeyV1:
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
                id="onboarding5.setemailkey.subtext.terra"
                defaultMessage="Enter an email address. This is not stored; you will email your recovery key here."
              />
            </Text>
            <Controller
              name="email"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => {
                return (
                  <TextInput
                    placeholder="Email address"
                    autoCapitalize="none"
                    inputMode="email"
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
      case EmailTab.EmailKeyZK: {
        return (
          <Text style={{ color: "#ffffff", marginTop: 10 }}>Coming soon…</Text>
        );
      }
    }
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
        {flow === KeyFlow.EditWallet || flow === KeyFlow.RecoverWallet ? (
          <FormattedMessage
            id="onboarding5.recovery.setemailkey"
            defaultMessage="Set a New Email Recovery Key"
          />
        ) : (
          <FormattedMessage
            id="onboarding5.setemailkey"
            defaultMessage="Set an Email Recovery Key"
          />
        )}
      </Text>

      <EmailTabs
        selectedTab={selectedTab}
        flow={KeyFlow.RecoverWallet}
        isObi={true}
        onPress={setSelectedTab}
      >
        {renderTabContent()}
      </EmailTabs>

      <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}>
        {!isKeyboardVisible && (
          <VerifyAndProceedButton
            disabled={!formState.isValid}
            onPress={handleSubmit(async (data) => {
              try {
                const { publicKey, privateKey } = generateSec256k1KeyPair();
                const URL = `mailto:${
                  data.email
                }?subject=Obi%20DO%20NOT%20DELETE:%20Recovery%20Assistant&body=${encodeForMailto(
                  "This is a v1 recovery key. You are sending it to yourself; Obi can never access its contents. " +
                    "This key is one-time use and can be used to help you recover if you lose multiple factors. " +
                    "DO NOT DELETE this email unless you are saving its contents to a password manager or physical location. In future versions " +
                    "of Obi, email recovery will use zero-knowledge proofs, and so saving an email will be unnecessary.  " +
                    privateKey
                )}`;

                setEmailKey(publicKey);
                await Linking.openURL(URL);
              } catch (e) {
                console.error(e);
                // noop
              }
            })}
          />
        )}
      </View>
    </EmailContainer>
  );
});
