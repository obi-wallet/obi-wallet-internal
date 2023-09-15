import {
  createGatekeeperConfig,
  KeyType,
  ObservableMultisigWallet,
  Secp256k1KeyPair,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Signer, SigningKey, Wallet } from "ethers";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as secp256k1 from "secp256k1";
import invariant from "tiny-invariant";
import { Presets } from "userop";

import { useEnv, useStore } from "../../../../contexts";
import { Alert, isSmallScreenNumber } from "../../../../helpers";
import { getTwilioClient } from "../../../../keys";
import {
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  /* OnboardingRoute,
  RecoverFrom,
  SettingsRoute,
  useRootNavigation, */
} from "../../../../router";
import { KeyboardAvoidingView } from "../../../keyboard-avoiding-view";
import { KeyboardAwareScrollView } from "../../../keyboard-aware-scroll-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import { PhoneOneTimeCodeInput } from "../../../phone-key";
import { Text } from "../../../typography";
import { VerifyAndProceedButton } from "../../../verify-and-proceed-button";

export type PhoneKeyConfirmScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.PhoneKeyConfirm
>;

export const PhoneKeyConfirmScreen = observer<PhoneKeyConfirmScreenProps>(
  function PhoneKeyConfirmScreen({ route }) {
    //const navigation = useRootNavigation();
    const { phoneSessionStore, sdkRootStore, walletsStore } = useStore();
    const { params } = route;

    async function generateEthereumAddresses(keyPair: Secp256k1KeyPair) {
      const signingKey = new SigningKey(
        Buffer.from(keyPair.privateKey, "base64"),
      );
      const signer: Signer = new Wallet(signingKey);
      const simpleAccount = await Presets.Builder.SimpleAccount.init(
        // @ts-expect-error this should be fine
        signer,
        "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
      );
      return {
        evmSignerAddress: await signer.getAddress(),
        evmUserContractAddress: simpleAccount.getSender(),
      };
    }

    return (
      <PhoneKeyConfirm
        {...params}
        onSubmit={async () => {
          const phoneKp = phoneSessionStore.getKp;
          invariant(phoneKp?.privateKey, "no phoneKp");
          const proxyAddress = "MISSING";
          const evmAddresses = await generateEthereumAddresses(phoneKp);
          const ethereumAccount = {
            chainId: "secret-4",
            zAuthKeyPair: phoneKp,
            proxyAddress: "MISSING",
            publicKey: phoneKp.publicKey,
            evmSignerAddress: evmAddresses.evmSignerAddress,
            evmUserContractAddress: evmAddresses.evmUserContractAddress,
          };
          const wallet = ObservableMultisigWallet.create({
            type: "multisig",
            data: {
              chain: "secret-4",
              owner: {
                keys: [
                  {
                    type: KeyType.ZAuth,
                    payload: {
                      publicKey: phoneKp.publicKey,
                      privateKey: phoneKp.privateKey,
                    },
                  },
                ],
                threshold: 1,
              },
              proxyAddress: {
                v: 1,
                address: proxyAddress,
              },
              gatekeeperConfig: createGatekeeperConfig().toJSON(),
              singlesigWallets: [],
              currentAccount: null,
            },
          });

          sdkRootStore.ethereumDemoStore.setEthereumAccount(
            proxyAddress,
            ethereumAccount,
          );
          wallet.setEvmSigningAddress(evmAddresses.evmSignerAddress, true);
          wallet.setEvmUserContractAddress(evmAddresses.evmUserContractAddress);
          walletsStore.upsertWallet(wallet);
          walletsStore.setCurrentWallet(wallet);
          // old ZOD flow
          /*
          switch (params.flow) {
            case KeyFlow.CreateWallet:
              navigation.navigate(OnboardingRoute.CreateWallet, params);
              break;
            case KeyFlow.EditWallet:
              navigation.navigate(SettingsRoute.MultisigSettings);
              break;
            case KeyFlow.RecoverWallet:
              navigation.navigate(OnboardingRoute.LookupProxyWallets, {
                ...params,
                recoverFrom: RecoverFrom.Phone,
              });
              break;
          }
          */
        }}
      />
    );
  },
);

export interface PhoneKeyConfirmProps {
  draftId: string;
  flow: KeyFlow;
  demoMode: boolean;

  phoneNumber: string;
  securityQuestion: string;
  securityAnswer: string;

  onSubmit(): void;
}

export const PhoneKeyConfirm = observer<PhoneKeyConfirmProps>(
  function PhoneKeyConfirm({
    // draftId,
    flow,
    demoMode,
    phoneNumber,
    // securityQuestion,
    securityAnswer,
    onSubmit,
  }) {
    const { chainStore, phoneSessionStore } = useStore();
    const chainId = chainStore.currentChain;
    const env = useEnv();
    const [key, setKey] = useState("");

    const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Magic Button disabled by default
    const [
      verifyButtonDisabledDoubleclick,
      setVerifyButtonDisabledDoubleclick,
    ] = useState(false); // Magic Button disable on button-click

    const minInputCharsSMSCode = 8;

    useEffect(() => {
      if (key.length >= minInputCharsSMSCode) {
        setVerifyButtonDisabled(false); // Enable Magic Button if checks are okay
      } else {
        setVerifyButtonDisabled(true);
        setVerifyButtonDisabledDoubleclick(false);
      }
    }, [verifyButtonDisabled, setVerifyButtonDisabled, key]);

    return (
      <OsmosisScreenContainer>
        <KeyboardAvoidingView
          style={{
            flex: 1,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              style={{
                flex: 1,
                paddingHorizontal: 20,
              }}
              contentContainerStyle={{
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <View>
                <View
                  style={{
                    justifyContent: "flex-end",
                    marginTop: 10,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "#F6F5FF",
                        fontSize: isSmallScreenNumber(20, 24),
                        fontWeight: "600",
                        marginTop: 32,
                      }}
                    >
                      {flow === KeyFlow.EditWallet ? (
                        <FormattedMessage
                          id="onboarding2.recovery.authyourkeys"
                          defaultMessage="Create a Replacement Phone Number Key"
                        />
                      ) : flow === KeyFlow.RecoverWallet ? (
                        <FormattedMessage
                          id="onboarding2.recovery.phonenumber"
                          defaultMessage="Recover your Phone Number Key"
                        />
                      ) : (
                        <FormattedMessage
                          id="onboarding3.authyourkeys"
                          defaultMessage="Authenticate Your Keys"
                        />
                      )}
                    </Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: isSmallScreenNumber(12, 14),
                        marginTop: 10,
                      }}
                    >
                      <FormattedMessage
                        id="onboarding3.pastereponse"
                        defaultMessage="Paste in the response you received to"
                      />{" "}
                      <Text style={{ fontWeight: "600" }}>{phoneNumber}.</Text>
                    </Text>
                  </View>
                </View>

                <PhoneOneTimeCodeInput
                  phoneNumber={phoneNumber}
                  phoneNumberMightBeIncorrect
                  value={key}
                  setValue={setKey}
                  onResend={async (voice) => {
                    const twilioClient = getTwilioClient({ demoMode, env });
                    // TODO: factor back out this workaround
                    await twilioClient.requestPublicKeyMagicCode({
                      phoneNumber,
                      securityAnswer,
                      chainId,
                      voice,
                    });
                    /*
                    const res = await twilioClient.requestPublicKeyMagicCode({
                      ...data,
                      chainId,
                      voice: false,
                    });
                    */
                  }}
                />
              </View>
              <View style={{ marginVertical: 20 }}>
                <VerifyAndProceedButton
                  onPress={async () => {
                    try {
                      setVerifyButtonDisabledDoubleclick(true);
                      const twilioClient = getTwilioClient({ demoMode, env });
                      let privkey = "";
                      if (/^081081\d{3,}/.test(key)) {
                        console.log(
                          "dev key. Remember your entry to use again: " + key,
                        );
                        const encoder = new TextEncoder();
                        const data = encoder.encode(
                          key +
                            "12081s1sw8vrast871-f-3pldht9qwfs;k;lsrtarbs8a7d821bnlp",
                        );
                        const hashBuffer = await crypto.subtle.digest(
                          "SHA-256",
                          data,
                        );
                        const hashUint8Array = new Uint8Array(hashBuffer);
                        const base64String = btoa(
                          String.fromCharCode(...hashUint8Array),
                        );
                        privkey = base64String;
                      } else {
                        privkey = await twilioClient.parseKeyMagicCodeResponse({
                          key,
                        });
                      }
                      type Kp = {
                        privateKey: string;
                        publicKey: {
                          type: "tendermint/PubKeySecp256k1";
                          value: string;
                        };
                      };
                      const kp: Kp = {
                        privateKey: privkey,
                        publicKey: {
                          type: "tendermint/PubKeySecp256k1",
                          value: Buffer.from(
                            secp256k1.publicKeyCreate(
                              new Uint8Array(Buffer.from(privkey, "base64")),
                            ),
                          ).toString("base64"),
                        },
                      };

                      if (kp.privateKey) {
                        draft.value.setPhoneKey({
                          publicKey: kp.publicKey,
                          // TODO: remove
                          privateKey: kp.privateKey,
                          phoneNumber,
                          securityQuestion,
                        });
                        phoneSessionStore.setKp(kp);
                        setVerifyButtonDisabledDoubleclick(false);
                        onSubmit();
                      } else {
                        setVerifyButtonDisabledDoubleclick(false);
                      }
                    } catch (e) {
                      const error = e as Error;
                      setVerifyButtonDisabledDoubleclick(false);
                      console.error(error);
                      Alert.alert(
                        "Error VerifyAndProceedButton (2)",
                        error.message,
                      );
                    }
                  }}
                  disabled={
                    verifyButtonDisabledDoubleclick
                      ? verifyButtonDisabledDoubleclick
                      : verifyButtonDisabled
                  }
                />
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </OsmosisScreenContainer>
    );
  },
);
