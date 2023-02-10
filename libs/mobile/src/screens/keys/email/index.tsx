import { pubkeyToAddress, pubkeyType } from "@cosmjs/amino";
import {
  createLcdClient,
  createStargateClient,
  isCosmosChain,
  isTerraChain,
  MultisigKey,
  Text,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { randomBytes } from "crypto";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, TouchableOpacity, View } from "react-native";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import secp256k1 from "secp256k1";

import {
  OnboardingRoute,
  SettingsRoute,
  useRootNavigation,
  useStore,
} from "../../..";
import { InlineButton } from "../../../app/button";
import { Back } from "../../../app/screens/components/back";
import { Background } from "../../../app/screens/components/background";
import { KeyboardAvoidingView } from "../../../app/screens/components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../app/screens/components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../app/screens/components/screen-size";
import { TextInput } from "../../../app/text-input";
import SocialLoop from "../../../assets/social-loop.svg";
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

export const EmailKey = observer<EmailKeyProps>(function EmailKey({
  draftId,
  flow,
  onSubmit,
}) {
  const { chainStore, configStore, draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const [email, setEmail] = useState("");
  const [selectedTab, setSelectedTab] = useState(Tab.EmailKeyV1);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Verify&Proceed Button disabled by default
  const isTerra = isTerraChain(chainStore.currentChain);
  const isObi = configStore.isObi();
  const intl = useIntl();

  useEffect(() => {
    if (generatedAddress === "") {
      const privateKeyBuffer = randomBytes(32);
      const publicKeyBuffer = Buffer.from(
        secp256k1.publicKeyCreate(privateKeyBuffer)
      ).toString("base64");
      setRecoveryKey(privateKeyBuffer.toString("base64"));
      setPublicKey(publicKeyBuffer);
      setGeneratedAddress(
        pubkeyToAddress(
          {
            type: pubkeyType.secp256k1,
            value: publicKeyBuffer,
          },
          "terra"
        )
      );
    }
    if (isValidEmail(email)) {
      setVerifyButtonDisabled(false); // Enable Verify&Proceed Button if checks are okay
    } else {
      setVerifyButtonDisabled(true);
    }
  }, [
    verifyButtonDisabled,
    email,
    chainStore.currentChainInformation.prefix,
    generatedAddress,
  ]);

  function isValidEmail(email: string): boolean {
    const regexp = new RegExp(
      /* eslint-disable-next-line no-useless-escape */
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    return regexp.test(email);
  }

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
          <View>
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
            <TextInput
              placeholder="email address"
              autoCapitalize="none"
              style={{ marginTop: 25 }}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        );
      case Tab.EmailKeyZK: {
        return <Text style={{ color: "#ffffff" }}>Coming soon...</Text>;
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
            <VerifyAndProceedButton
              disabled={verifyButtonDisabled}
              onPress={async () => {
                if (publicKey) {
                  draft.value.setEmailKey({
                    publicKey: {
                      type: pubkeyType.secp256k1,
                      value: publicKey,
                    },
                  });
                  Linking.openURL(
                    `mailto:${email}?subject=Obi%20DO%20NOT%20DELETE:%20Recovery%20Assistant&body=${encodeForMailto(
                      "This is a v1 recovery key. You are sending it to yourself; Obi can never access its contents. " +
                        "This key is one-time use and can be used to help you recover if you lose multiple factors. " +
                        "DO NOT DELETE this email unless you are saving its contents to a password manager or physical location. In future versions " +
                        "of Obi, email recovery will use zero-knowledge proofs, and so saving an email will be unnecessary.  " +
                        recoveryKey
                    )}`
                  );
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
                        onPress: () => onSubmit(),
                      },
                    ],
                    { cancelable: false }
                  );
                } else {
                  Alert.alert(
                    intl.formatMessage({
                      id: "onboarding5.error.noactivity.title",
                    }),
                    intl.formatMessage({
                      id: "onboarding5.error.noactivity.subtext",
                    })
                  );
                }
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});
