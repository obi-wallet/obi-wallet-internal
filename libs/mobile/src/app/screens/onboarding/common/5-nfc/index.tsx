import { pubkeyType } from "@cosmjs/amino";
import { RequestVerifyADR36AminoSignDoc } from "@keplr-wallet/background";
import {
  createLcdClient,
  createStargateClient,
  isMultisigDemoWallet,
  Text,
  WalletType,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AES } from "crypto-js";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import NfcManager, { Ndef, NfcEvents, RegisterTagEventOpts } from 'react-native-nfc-manager';
import { SafeAreaView } from "react-native-safe-area-context";
import { tags } from "react-native-svg/lib/typescript/xml";


import { InlineButton } from "../../../../button";
import { Button } from "../../../../button";
import {
  getNFCPublicKey,
} from "../../../../nfc";
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
    const demoMode = isMultisigDemoWallet(wallet);
    const [hasNfc, setHasNFC] = useState(false);
    const [reading, setReading] = useState(false);
    const [scannedNFC, setScannedNFC] = useState(false);
    const [address, setAddress] = useState("");
    const [passportModal, setPassportModal] = useState(false);
    const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Verify&Proceed Button disabled by default
    const [fetchingPubKey, setFetchingPubKey] = useState(false);
    const [passportNumber, setPassportNumber] = useState('');
    const [dob, setDob] = useState('');
    const [expiry, setExpiry] = useState('');
    const isObi = configStore.isObi();
    const isTerra = wallet.type === WalletType.TerraMultisig;
    const intl = useIntl();
    const minAddressInputChars = 43;

    /* const scanPassport = async () => {
      setPassportModal(false);

      const passportDetails = await PassportReader.scan({
        // yes, you need to know a bunch of data up front
        // this is data you can get from reading the MRZ zone of the passport
        documentNumber: passportNumber,
        dateOfBirth: dob,
        dateOfExpiry: expiry,
      })

      Alert.alert("Passport details: ", JSON.stringify(passportDetails));
    }

    const getPassportDetails = async() => {
      setPassportModal(true);
    } */

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

      NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
        setReading(false);
        let parsed = null;
        if (tag.ndefMessage && tag.ndefMessage.length > 0) {
          // ndefMessage is actually an array of NdefRecords, 
          // and we can iterate through each NdefRecord, decode its payload 
          // according to its TNF & type
          const ndefRecords = tag.ndefMessage;
          parsed = ndefRecords.map(decodeNdefRecord);
          const publicKey = await getNFCPublicKey({
            demoMode, parsed
          });
          await wallet.setNFCPublicKey({
            publicKey: {
              type: pubkeyType.secp256k1,
              value: publicKey,
            },
          });
          setScannedNFC(true);
        }
      })

      const decodeNdefRecord = (record: any) => {
        if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
          return ['text', Ndef.text.decodePayload(record.payload)];
        } else if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
          return ['uri', Ndef.uri.decodePayload(record.payload)];
        }

        return ['unknown', '---']
      }

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

    const readYubikey = async () => {
      const options: RegisterTagEventOpts = {
        alertMessage: "Hold a YubiKey NFC near the top back of your phone to use it as entropy for a new deterministic keypair. No information is stored by Obi."
      };
      setReading(true);
      await NfcManager.registerTagEvent(options);
    }

    const readCard = async () => {
      const options: RegisterTagEventOpts = {
        alertMessage: "Hold a credit, debit, or other card near the top back of your phone to use it as entropy for a new deterministic keypair. No information is stored by Obi."
      };
      setReading(true);
      await NfcManager.registerTagEvent(options);
    }

    const readTag = async () => {
      const options: RegisterTagEventOpts = {
        alertMessage: "Hold an NFC Tag near the top back of your phone to use its information as entropy for a new deterministic keypair. No information is stored by Obi."
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
          { passportModal
          ? (        <View>
            <Text><FormattedMessage
                        id="onboarding5.passportnumber"
                        defaultMessage="Passport Number"
                      /></Text>
            <TextInput
                value={passportNumber}
                onChangeText={text => setPassportNumber(text)}
                placeholder="123456789"
            />
            <Text><FormattedMessage
                        id="onboarding5.dateofbirth"
                        defaultMessage="Date of Birth (YYMMDD)"
                      /></Text>
            <TextInput
                value={dob}
                onChangeText={text => setDob(text)}
                placeholder="96/01/15"
            />
            <Text><FormattedMessage
                        id="onboarding5.expirationdate"
                        defaultMessage="Expiration Date (YYMMDD)"
                      /></Text>
            <TextInput
                value={expiry}
                onChangeText={text => setExpiry(text)}
                placeholder="26/01/15"
            />
            <Button
              flavor="green"
              label={intl.formatMessage({
                id: "onboarding5.confirm",
                defaultMessage: "Confirm",
              })}
            />
        </View>)
        :
          (<><View
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
                      ? (<>
                        <Button
                          label={intl.formatMessage({
                            id: "onboarding5.scanyubikey",
                            defaultMessage: "Tap YubiKey",
                          })}
                          flavor="blue"
                          onPress={readYubikey}
                          disabled={false}
                          style={[{ marginTop: 40, marginBottom: 40 }]}
                        />
                        <Button
                          label={intl.formatMessage({
                            id: "onboarding5.scanpassport",
                            defaultMessage: "Tap Passport",
                          })}
                          flavor="blue"
                          disabled={true}
                          style={[{ marginTop: 40, marginBottom: 40 }]}
                        />
                        <Button
                          label={intl.formatMessage({
                            id: "onboarding5.scancard",
                            defaultMessage: "Tap Card",
                          })}
                          flavor="blue"
                          onPress={readCard}
                          disabled={false}
                          style={[{ marginTop: 40, marginBottom: 40 }]}
                        />
                        <Button
                          label={intl.formatMessage({
                            id: "onboarding5.scancard",
                            defaultMessage: "Tap NFC Tag",
                          })}
                          flavor="blue"
                          onPress={readTag}
                          disabled={false}
                          style={[{ marginTop: 40 }]}
                        />
                      </>)
                      : null
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
                      : null}
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
                      : null}
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
                if (scannedNFC) {
                  if (wallet.keyInRecovery !== "nfc") {
                    navigation.navigate(OnboardingRoute.CreateMultisigPhoneNumber);
                  } else {
                    navigation.navigate(OnboardingRoute.ReplaceMultisig);
                  }
                } else {
                  Alert.alert(
                    intl.formatMessage({
                      id: "onboarding5.nfcnotscanned",
                      defaultMessage: "NFC not scanned",
                    }),
                    intl.formatMessage({
                      id: "onboarding5.nfcnotscannedsubtext",
                      defaultMessage: "Please scan an NFC key.",
                    }),
                    [
                      {
                        text: intl.formatMessage({
                          id: "onboarding5.ok",
                          defaultMessage: "OK",
                        }),
                      },
                    ]
                  );
                }
              }}
            />
          </View>
        </>)}
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
);
