import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@obi-wallet/common";
import { useAppStateEffect } from "@obi-wallet/headless-ui";
import {
  generateSec256k1KeyPair,
  MultisigKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, Linking, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import {
  OnboardingRoute,
  SettingsRoute,
  useRootNavigation,
  useStore,
} from "../../..";
import { Back } from "../../../app/screens/components/back";
import { Background } from "../../../app/screens/components/background";
import { KeyboardAvoidingView } from "../../../app/screens/components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../app/screens/components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../app/screens/components/screen-size";
import { TextInput } from "../../../app/text-input";
import SocialLoop from "../../../assets/social-loop.svg";
import { useKeyboardVisible } from "../../../helpers/keyboard-visible";
import { KeyFlow, KeyRoute, KeyStackParamList } from "../key-stack";

export type EmailKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.EmailKey
>;

enum Tab {
  EmailKeyV1,
  EmailKeyZK,
}

export const EmailKeyScreen = observer<EmailKeyScreenProps>(
  function EmailKeyScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

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
  const { configStore, draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const [selectedTab, setSelectedTab] = useState(Tab.EmailKeyV1);
  const isObi = configStore.isObi();
  const intl = useIntl();
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
  });

  function encodeForMailto(text: string): string {
    return encodeURIComponent(text).replace(/%20/g, "%20");
  }

  function renderTabButton({
    tab,
    label,
    isObi = false,
  }: {
    tab: Tab;
    label: string;
    isObi?: boolean;
  }) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab(tab);
          }}
          style={{
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            borderTopLeftRadius: tab === Tab.EmailKeyV1 ? 12 : 0,
            borderTopRightRadius: tab === Tab.EmailKeyZK ? 12 : 0,
            ...(selectedTab === tab && !isObi
              ? { backgroundColor: "#130F23" }
              : {}),
          }}
        >
          <Text
            style={{
              color: selectedTab === tab && !isObi ? "#89F5C2" : "white",
              textDecorationLine:
                selectedTab === tab && !isObi ? "underline" : "none",
              ...(selectedTab === tab && isObi
                ? { fontWeight: "700" }
                : { fontFamily: "poppins-light" }),
            }}
          >
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderTabContent() {
    switch (selectedTab) {
      case Tab.EmailKeyV1:
        return (
          <>
            <Text
              style={{
                color: isObi ? "#fff" : "#999CB6",
                fontSize: isSmallScreenNumber(12, 14),
                marginTop: 10,
              }}
            >
              {flow === KeyFlow.RecoverWallet ? (
                <FormattedMessage
                  id="onboarding5.recovery.emailsubtext.cosmos"
                  defaultMessage="Enter your recovery key from your email. (This is one-time use and will be replaced with a new recovery key.)"
                />
              ) : (
                <FormattedMessage
                  id="onboarding5.setemailkey.subtext.terra"
                  defaultMessage="Enter an email address. This is not stored; you will email your recovery key here."
                />
              )}
            </Text>
            <Controller
              name="email"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="email address"
                  autoCapitalize="none"
                  autoComplete="email"
                  inputMode="email"
                  style={{ marginTop: 25 }}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </>
        );
      case Tab.EmailKeyZK: {
        return (
          <Text style={{ color: "#ffffff", marginTop: 10 }}>
            Coming soon...
          </Text>
        );
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <View>
            <Back
              style={{
                marginLeft: -5,
                padding: 5,
                width: 25,
              }}
            />
            {isObi ? undefined : <SocialLoop width={70} height={70} />}
            <View>
              <Text
                style={{
                  color: "#F6F5FF",
                  fontSize: isSmallScreenNumber(20, 24),
                  fontWeight: "600",
                  marginTop: isSmallScreenNumber(20, 32),
                  textAlign: "center",
                }}
              >
                {flow === KeyFlow.EditWallet ? (
                  <FormattedMessage
                    id="onboarding5.recovery.setemailkey"
                    defaultMessage="Set a New Email Recovery Key"
                  />
                ) : flow === KeyFlow.RecoverWallet ? (
                  <FormattedMessage
                    id="onboarding2.recovery.email"
                    defaultMessage="Recover your Email Key"
                  />
                ) : (
                  <FormattedMessage
                    id="onboarding5.setemailkey"
                    defaultMessage="Set an Email Recovery Key"
                  />
                )}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                height: 50,
                ...(isObi && {
                  borderBottomColor: "rgba(250,250,250,.2)",
                  borderBottomWidth: 1,
                }),
                marginTop: 50,
                marginBottom: 20,
                marginHorizontal: isObi ? 10 : 0,
              }}
            >
              {renderTabButton({
                tab: Tab.EmailKeyV1,
                label: intl.formatMessage({
                  id: "keys.email.tabs.simplekey",
                  defaultMessage: "Simple 1 Use Key",
                }),
                isObi,
              })}
              {renderTabButton({
                tab: Tab.EmailKeyZK,
                label: intl.formatMessage({
                  id: "keys.email.tabs.zkkey",
                  defaultMessage: "Zero Knowledge Key",
                }),
                isObi,
              })}
            </View>
            <View>{renderTabContent()}</View>
          </View>
          <View
            style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}
          >
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
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});
