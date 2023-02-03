import {
  createLcdClient,
  createStargateClient,
  isCosmosChain,
  isTerraChain,
  MultisigKey,
  Text,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export type SocialKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.SocialKey
>;

export const SocialKeyScreen = observer<SocialKeyScreenProps>(
  function SocialKeyScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    return (
      <SocialKey
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

export interface SocialKeyProps {
  draftId: string;
  flow: KeyFlow;
  onSubmit(): void;
}

export const SocialKey = observer<SocialKeyProps>(function SocialKey({
  draftId,
  flow,
  onSubmit,
}) {
  const { chainStore, configStore, draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const [address, setAddress] = useState("");
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Verify&Proceed Button disabled by default
  const [fetchingPubKey, setFetchingPubKey] = useState(false);
  const isTerra = isTerraChain(chainStore.currentChain);
  const obiAddress = isTerra
    ? "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4"
    : "juno17w77rnps59cnallfskg42s3ntnlhrzu2mjkr3e";
  const isObi = configStore.isObi();
  const intl = useIntl();

  const minAddressInputChars = 43;

  useEffect(() => {
    if (
      address.length >= minAddressInputChars &&
      address.startsWith(chainStore.currentChainInformation.prefix)
    ) {
      setVerifyButtonDisabled(false); // Enable Verify&Proceed Button if checks are okay
    } else {
      setVerifyButtonDisabled(true);
    }
  }, [
    verifyButtonDisabled,
    address,
    chainStore.currentChainInformation.prefix,
  ]);

  async function getAccountPubkey(key: string) {
    const chainId = chainStore.currentChain;
    if (isCosmosChain(chainId)) {
      const client = await createStargateClient(chainId);

      try {
        const account = await client.getAccount(key);
        return account?.pubkey;
      } catch (e) {
        console.log(e);
        return null;
      } finally {
        client.disconnect();
      }
    } else {
      try {
        const client = createLcdClient(chainId);
        const account = await client.auth.accountInfo(key);
        return account.getPublicKey()?.toAmino();
      } catch (e) {
        console.log(e);
        return null;
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
                {isObi ? undefined : <SocialLoop width={70} height={70} />}
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: isSmallScreenNumber(20, 24),
                    fontWeight: "600",
                    marginTop: isSmallScreenNumber(20, 32),
                  }}
                >
                  {flow === KeyFlow.EditWallet ? (
                    <FormattedMessage
                      id="onboarding5.recovery.setsocialkey"
                      defaultMessage="Set a New Social Key"
                    />
                  ) : flow === KeyFlow.RecoverWallet ? (
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
                  {flow === KeyFlow.RecoverWallet ? (
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
              {flow !== KeyFlow.RecoverWallet ? (
                <FormattedMessage
                  id="onboarding5.setsocialkey.subtext2"
                  defaultMessage="…or you can use the demo account if you don't trust any of your friends"
                />
              ) : null}
            </Text>

            <InlineButton
              label={intl.formatMessage({
                id: "onboarding5.useobiaccount",
              })}
              style={{ alignSelf: "flex-start", marginTop: 10 }}
              onPress={() => {
                setAddress(obiAddress);
              }}
            />
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
                  draft.value.setSocialKey({
                    // @ts-expect-error TODO: TypeScript doesn't understand this specific case
                    publicKey,
                  });
                  onSubmit();
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
