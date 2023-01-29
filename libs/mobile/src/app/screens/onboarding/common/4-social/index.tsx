import {
  createLcdClient,
  createStargateClient,
  Text,
  WalletType,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PeopleIcon from "./assets/people-alt-twotone-24px.svg";
import { InlineButton } from "../../../../button";
import { useMultisigWallet, useStore } from "../../../../stores";
import { TextInput } from "../../../../text-input";
import { Back } from "../../../components/back";
import { Background } from "../../../components/background";
import { KeyboardAvoidingView } from "../../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../components/screen-size";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../onboarding-stack";

export type MultisigSocialProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateMultisigSocial
>;

export const MultisigSocial = observer<MultisigSocialProps>(
  function MultisigSocial({ navigation }) {
    const { chainStore, configStore } = useStore();
    const wallet = useMultisigWallet();
    const [address, setAddress] = useState("");
    const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Verify&Proceed Button disabled by default
    const [fetchingPubKey, setFetchingPubKey] = useState(false);
    const obi_address =
      configStore.getDefaultMultisigWalletType() === WalletType.CosmosMultisig
        ? "juno17w77rnps59cnallfskg42s3ntnlhrzu2mjkr3e"
        : "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4";
    const isObi = configStore.isObi();
    const isTerra = wallet.type === WalletType.TerraMultisig;
    const intl = useIntl();

    const minAddressInputChars = 43;

    useEffect(() => {
      if (
        address.length >= minAddressInputChars &&
        address.startsWith(isTerra ? "terra1" : "juno1")
      ) {
        setVerifyButtonDisabled(false); // Enable Verify&Proceed Button if checks are okay
      } else {
        setVerifyButtonDisabled(true);
      }
    }, [isTerra, verifyButtonDisabled, address]);

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
      if (isTerra) {
        try {
          const client = createLcdClient(chainStore.currentTerraChain);
          const account = await client.auth.accountInfo(key);
          return account.getPublicKey()?.toAmino();
        } catch (e) {
          console.log(e);
          return null;
        }
      } else {
        const client = await createStargateClient(
          chainStore.currentCosmosChain
        );

        try {
          const account = await client.getAccount(key);
          return account?.pubkey;
        } catch (e) {
          console.log(e);
          return null;
        } finally {
          client.disconnect();
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

              <View>
                <View>
                  {isObi ? undefined : <PeopleIcon width={70} height={70} />}
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontSize: isSmallScreenNumber(20, 24),
                      fontWeight: "600",
                      marginTop: isSmallScreenNumber(20, 32),
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
                      color: isObi ? "#fff" : "#999CB6",
                      fontSize: isSmallScreenNumber(12, 14),
                      marginTop: 10,
                    }}
                  >
                    {wallet.keyInRecovery === "biometrics" ? (
                      isTerra ? (
                        <FormattedMessage
                          id="onboarding5.recovery.socialsubtext.terra"
                          defaultMessage="Enter the Terra address of a trusted friend that you used when creating the wallet."
                        />
                      ) : (
                        <FormattedMessage
                          id="onboarding5.recovery.socialsubtext.cosmos"
                          defaultMessage="Enter the Juno address of a trusted friend that you used when creating the wallet."
                        />
                      )
                    ) : isTerra ? (
                      <FormattedMessage
                        id="onboarding5.setsocialkey.subtext.terra"
                        defaultMessage="Enter the Terra address of a trusted friend who can help you recover your account."
                      />
                    ) : (
                      <FormattedMessage
                        id="onboarding5.setsocialkey.subtext.cosmos"
                        defaultMessage="Enter the Juno address of a trusted friend who can help you recover your account."
                      />
                    )}
                  </Text>
                </View>
              </View>
              <TextInput
                placeholder={isTerra ? "terra1234…" : "juno1234…"}
                style={{ marginTop: 25 }}
                value={address}
                onChangeText={setAddress}
              />
              <Text
                style={{
                  color: isObi ? "#fff" : "#999CB6",
                  fontSize: isSmallScreenNumber(12, 14),
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
            <View
              style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}
            >
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
                      // @ts-expect-error TODO: TypeScript doesn't understand this specific case
                      publicKey,
                    });
                    if (wallet.keyInRecovery !== "social") {
                      navigation.navigate(OnboardingRoute.CreateMultisigInit);
                    } else {
                      navigation.navigate(OnboardingRoute.ReplaceMultisig);
                    }
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
  }
);
