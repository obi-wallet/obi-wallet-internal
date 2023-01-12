import { RequestVerifyADR36AminoSignDoc } from "@keplr-wallet/background";
import {
  createLcdClient,
  createStargateClient,
  Text,
  WalletType,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AES } from "crypto-js";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import NfcManager, { NfcEvents, RegisterTagEventOpts } from 'react-native-nfc-manager';
import { SafeAreaView } from "react-native-safe-area-context";
import { tags } from "react-native-svg/lib/typescript/xml";

import { InlineButton } from "../../../../button";
import { Button } from "../../../../button";
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

export type MultisigNFCProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateMultisigNFC
>;

interface Details {
    passportNumber: string;
    dob: string;
    expiry: string;
}

export const MultisigNFC = observer<MultisigNFCProps>(
  ({ navigation }) => {
    const { chainStore, configStore } = useStore();
    const wallet = useMultisigWallet();
    const [hasNfc, setHasNFC] = useState(false);
    const [reading, setReading] = useState(false);
    const [address, setAddress] = useState("");
    const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Verify&Proceed Button disabled by default
    const [fetchingPubKey, setFetchingPubKey] = useState(false);
    const isObi = configStore.isObi();
    const isTerra = wallet.type === WalletType.TerraMultisig;
    const intl = useIntl();
    const minAddressInputChars = 43;
    const [passportNumber, setPassportNumber] = useState("");
    const [dob, setDob] = useState("");
    const [expiry, setExpiry] = useState("");
    const [MRZKey, setMRZKey] = useState("");

    const calculateCheckDigit = (str: string) => {
        let sum = 0;
        for (let i = 0; i < str.length; i++) {
            sum += str.charCodeAt(i) * (i + 1);
        }
        return (sum % 10).toString();
    }

    useEffect(() => {
        if (passportNumber && dob && expiry) {
            const passportNumberCheck = calculateCheckDigit(passportNumber);
            const dobCheck = calculateCheckDigit(dob);
            const expiryCheck = calculateCheckDigit(expiry);
            setMRZKey(`${passportNumber}${passportNumberCheck}${dob}${dobCheck}${expiry}${expiryCheck}`);
        }
    }, [passportNumber, dob, expiry]);

    const handlePassportScan = () => {
        Alert.prompt(
            "Passport scan",
            "Please enter passport details",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: (details: Details) => {
                        setPassportNumber(details.passportNumber);
                        setDob(details.dob);
                        setExpiry(details.expiry);
                    }
                }
            ],
            [
              {
                label: "Passport Number",
                placeholder: "123456789",
                name: "passportNumber",
                type: "text"
              },
              {
                label: "Date of Birth (MM/DD/YY)",
                placeholder: "01/01/01",
                name: "dob",
                type: "text"
              },
              {
                label: "Expiration Date (MM/DD/YY)",
                placeholder: "01/01/01",
                name: "expiry",
                type: "text"
              }
            ]
        );
    };

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
      const checkIsSupported = async () => {
        const deviceIsSupported = await NfcManager.isSupported()

        setHasNFC(deviceIsSupported)
        if (deviceIsSupported) {
          await NfcManager.start()
        }
      }

      checkIsSupported()

      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
        setReading(false);
        Alert.alert("Tag Discovered: ", JSON.stringify(tag));
      })

      const { nfc } = wallet.nextAdmin;

      if (
        nfc &&
        wallet.keyInRecovery !== "nfc" &&
        wallet.keyInRecovery !== "biometrics"
      ) {
        Alert.alert(
          intl.formatMessage({ id: "onboarding4.error.nfckeyexists.title" }),
          intl.formatMessage({ id: "onboarding4.error.nfckeyexists.text" }) +
          ` ${nfc.address}?`,
          [
            {
              text: intl.formatMessage({
                id: "onboarding4.error.nfckeyexists.newkey",
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

    const readTag = async () => {
      const options: RegisterTagEventOpts = {
        alertMessage: "Use NFC (Passport, Credit Card, YubiKey, Badge) as entropy for a new deterministic keypair. No information is stored by Obi."
      };
      setReading(true);
      await NfcManager.registerTagEvent(options);
    }

    const cancelReadTag = async () => {
      setReading(false);
      await NfcManager.unregisterTagEvent();
    }

    async function getAccountPubkey(key: string) {
      if (isTerra) {
        try {
          const client = createLcdClient(chainStore.currentTerraChain);
          const account = await client.auth.accountInfo(key);
          return account.getPublicKey()?.toAmino();
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
        }
      } else {
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
                    {wallet.keyInRecovery === "nfc" ? (
                      <FormattedMessage
                        id="onboarding5.recovery.setnfckey"
                        defaultMessage="Set a New NFC Key"
                      />
                    ) : wallet.keyInRecovery === "biometrics" ? (
                      <FormattedMessage
                        id="onboarding2.recovery.nfckey"
                        defaultMessage="Recover your NFC Key"
                      />
                    ) : (
                      <FormattedMessage
                        id="onboarding5.setnfckey"
                        defaultMessage="Set up an NFC Key"
                      />
                    )}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: "#999CB6",
                      fontSize: 14,
                      marginTop: 10,
                    }}
                  >
                    {wallet.keyInRecovery === "nfc" ? (
                      <FormattedMessage
                        id="onboarding5.recovery.nfcsubtext"
                        defaultMessage="Hold up the NFC-compatible item (passport, badge, credit card, YubiKey, etc.) that you used when creating your wallet."
                      />
                    ) : <FormattedMessage
                      id="onboarding5.setnfckey.subtext.terra"
                      defaultMessage="Hold up an NFC-compatible item (passport, badge, credit card, YubiKey, etc.). No data will be stored from your item."
                    />
                    }
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: "#999CB6",
                      fontSize: 14,
                      marginTop: 10,
                    }}
                  >
                    {hasNfc && !reading
                      ? (<Button
                        label={intl.formatMessage({
                          id: "onboarding5.scannfcnow",
                          defaultMessage: "Scan NFC Now",
                        })}
                        flavor="blue"
                        onPress={readTag}
                        disabled={false}
                        style={[{ marginTop: 40 }]}
                      />)
                      :null
                    }
                    {hasNfc && reading
                      ? (<Button
                        label={intl.formatMessage({
                          id: "onboarding5.scannfcnow",
                          defaultMessage: "Cancel NFC Scan",
                        })}
                        flavor="blue"
                        onPress={cancelReadTag}
                        disabled={false}
                        style={[{ marginTop: 40 }]}
                      />)
                    :null}
                    {!hasNfc
                      ? (<Text
                          style={{
                            color: "#999CB6",
                            fontSize: 14,
                            marginTop: 10,
                          }}>
                          <FormattedMessage
                            id="onboarding5.nfcunavailable"
                            defaultMessage="No NFC available on this device."
                          />
                        </Text>
                      )
                    :null}
                  </Text>
                </View>
              </View>
            </View>
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
                  await wallet.setNFCPublicKey({
                    // @ts-expect-error TODO: TypeScript doesn't understand this specific case
                    publicKey,
                  });
                  if (wallet.keyInRecovery !== "nfc") {
                    navigation.navigate(OnboardingRoute.CreateMultisigInit);
                  } else {
                    navigation.navigate(OnboardingRoute.ReplaceMultisig);
                  }
                }
              }}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
);
