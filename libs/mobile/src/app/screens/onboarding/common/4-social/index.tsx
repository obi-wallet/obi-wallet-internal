import { createStargateClient, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { InlineButton } from "../../../../button";
import { useMultisigWallet, useStore } from "../../../../stores";
import { TextInput } from "../../../../text-input";
import { Back } from "../../../components/back";
import { Background } from "../../../components/background";
import { KeyboardAvoidingView } from "../../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../components/phone-number/verify-and-proceed-button";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../onboarding-stack";
import PeopleIcon from "./assets/people-alt-twotone-24px.svg";

export type MultisigSocialProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateMultisigSocial
>;

export const MultisigSocial = observer<MultisigSocialProps>(
  ({ navigation }) => {
    const { chainStore, configStore } = useStore();
    const wallet = useMultisigWallet();
    const [address, setAddress] = useState("");
    const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Verify&Proceed Button disabled by default
    const [fetchingPubKey, setFetchingPubKey] = useState(false);
    const obi_address = "juno17w77rnps59cnallfskg42s3ntnlhrzu2mjkr3e";
    const isObi = configStore.isObi();
    const intl = useIntl();

    const minAddressInputChars = 43;

    useEffect(() => {
      if (
        address.length >= minAddressInputChars &&
        address.startsWith("juno1")
      ) {
        setVerifyButtonDisabled(false); // Enable Verify&Proceed Button if checks are okay
      } else {
        setVerifyButtonDisabled(true);
      }
    }, [verifyButtonDisabled, address]);

    useEffect(() => {
      const { social } = wallet.nextAdmin;

      if (
        social &&
        wallet.keyInRecovery !== "social" &&
        wallet.keyInRecovery !== "biometrics"
      ) {
        Alert.alert(
          intl.formatMessage({ id: "onboarding4.error.socialkeyexists.title" }),
          intl.formatMessage({ id: "onboarding4.error.socialkeyexists.text" }) +
            ` ${social.address}?`,
          [
            {
              text: intl.formatMessage({
                id: "onboarding4.error.socialkeyexists.newkey",
              }),
              style: "cancel",
            },
            {
              text: intl.formatMessage({
                id: "general.yes",
              }),
              onPress: () => {
                navigation.navigate(OnboardingRoute.CreateMultisigInit);
              },
            },
          ]
        );
      }
    }, [intl, wallet, navigation]);

    async function getAccountPubkey(key: string) {
      const client = await createStargateClient(chainStore.currentChain);

      try {
        const account = await client.getAccount(key);
        return account?.pubkey;
      } catch (e) {
        console.log(e);
        Alert.alert(
          intl.formatMessage({
            id: "onboarding5.error.noactivity.title",
          }),
          intl.formatMessage({
            id: "onboarding5.error.noactivity.subtext",
          })
        );
        return null;
      } finally {
        client.disconnect();
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
                  marginTop: 20,
                  marginLeft: -5,
                  padding: 5,
                  width: 25,
                }}
              />

              <View
                style={{
                  justifyContent: "flex-end",
                  marginTop: isObi ? 10 : 43,
                }}
              >
                <View>
                  {isObi ? undefined : <PeopleIcon width={70} height={70} />}
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontSize: 24,
                      fontWeight: "600",
                      marginTop: 32,
                    }}
                  >
                    {wallet.keyInRecovery === "social" ? (
                      <FormattedMessage
                        id="onboarding5.recovery.setsocialkey"
                        defaultMessage="Set a New Social Key"
                      />
                    ) : wallet.keyInRecovery === "biometrics" ? (
                      <FormattedMessage
                        id="onboarding2.recovery.social"
                        defaultMessage="Recover your Social Key"
                      />
                    ) : (
                      <FormattedMessage
                        id="onboarding5.setsocialkey"
                        defaultMessage="Set a Social Key"
                      />
                    )}
                  </Text>
                  <Text
                    style={{
                      color: "#999CB6",
                      fontSize: 14,
                      marginTop: 10,
                    }}
                  >
                    {wallet.keyInRecovery === "biometrics" ? (
                      <FormattedMessage
                        id="onboarding5.recovery.socialsubtext"
                        defaultMessage="Enter the juno address of a trusted friend that you used when creating the wallet."
                      />
                    ) : (
                      <FormattedMessage
                        id="onboarding5.setsocialkey.subtext"
                        defaultMessage="Enter the juno address of a trusted friend who can help you recover your account."
                      />
                    )}
                  </Text>
                </View>
              </View>
              <TextInput
                placeholder="juno1234...."
                style={{ marginTop: 25 }}
                value={address}
                onChangeText={setAddress}
              />
              <Text
                style={{
                  color: "#999CB6",
                  fontSize: 14,
                  marginTop: 10,
                }}
              >
                {wallet.keyInRecovery === "social" &&
                wallet.nextAdmin?.social?.address === obi_address ? (
                  <FormattedMessage
                    id="onboarding5.recovery.setsocialkey.subtext2"
                    defaultMessage="You're currently using the demo account. This will remove the demo account from your multisig and replace it with your friend's key."
                  />
                ) : wallet.keyInRecovery !== "biometrics" ? (
                  <FormattedMessage
                    id="onboarding5.setsocialkey.subtext2"
                    defaultMessage="…or you can use the demo account if you don't trust any of your friends"
                  />
                ) : null}
              </Text>

              {wallet.keyInRecovery === "social" &&
              wallet.nextAdmin?.social?.address === obi_address ? null : (
                <InlineButton
                  label={intl.formatMessage({
                    id: "onboarding5.useobiaccount",
                  })}
                  style={{ alignSelf: "flex-start", marginTop: 10 }}
                  onPress={() => {
                    setAddress(obi_address);
                  }}
                />
              )}
            </View>
            <View>
              <VerifyAndProceedButton
                disabled={
                  verifyButtonDisabled ? verifyButtonDisabled : fetchingPubKey
                }
                onPress={async () => {
                  setFetchingPubKey(true);
                  const publicKey = await getAccountPubkey(address);
                  setFetchingPubKey(false);

                  if (publicKey) {
                    await wallet.setSocialPublicKey({
                      publicKey,
                    });
                    if (wallet.keyInRecovery !== "social") {
                      navigation.navigate(OnboardingRoute.CreateMultisigInit);
                    } else {
                      navigation.navigate(OnboardingRoute.ReplaceMultisig);
                    }
                  }
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
);
