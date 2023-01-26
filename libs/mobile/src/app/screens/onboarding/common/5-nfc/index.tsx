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
import { observer } from "mobx-react-lite";
import { scan } from "ramda";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, FlatList, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import NfcManager, { Ndef, NfcEvents, RegisterTagEventOpts } from 'react-native-nfc-manager';

import {
  getNFCPublicKey,
} from "../../../../nfc";
import { useMultisigWallet, useStore } from "../../../../stores";
import { OnboardingScreenContainer } from "../../../components/onboarding-screen-container";
import { VerifyAndProceedButton } from "../../../components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../components/screen-size";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../onboarding-stack";
import PeopleIcon from "./assets/people-alt-twotone-24px.svg";

export type MultisigNFCProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateMultisigNFC
>;

export const MultisigNFC = observer<MultisigNFCProps>(
  ({ navigation }) => {
    const { chainStore, configStore } = useStore();
    const wallet = useMultisigWallet();
    const demoMode = isMultisigDemoWallet(wallet);
    const [hasNfc, setHasNFC] = useState(false);
    const [reading, setReading] = useState(false);
    const [scannedNFC, setScannedNFC] = useState(false);
    const [selectedTagType, setSelectedTagType] = useState("");
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
        if (await tag.ndefMessage && await tag.ndefMessage.length > 0) {
          // ndefMessage is actually an array of NdefRecords, 
          // and we can iterate through each NdefRecord, decode its payload 
          // according to its TNF & type
          const ndefRecords = await tag.ndefMessage;
          parsed = await ndefRecords.map(decodeNdefRecord);
          const publicKey = await getNFCPublicKey({
            demoMode, parsed: JSON.stringify(parsed)
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

    const readPassport = async () => {
      // todo
    }

    function ListItem({
      item,
      onScanPress,
    }: {
      item: { id: number; title: string };
      onScanPress: () => void;
    }) {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: isSmallScreenNumber(10, 15),
            paddingVertical: isSmallScreenNumber(10, 15),
            backgroundColor: "#272727",
            borderRadius: 10,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: isSmallScreenNumber(14, 14),
              fontWeight: "600",
              marginLeft: 10,
            }}
          >
            {item.title}
          </Text>
          { !scannedNFC 
            ? <TouchableOpacity
              style={{
                backgroundColor: "#fff",
                borderRadius: 30,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              onPress={onScanPress}
            ><Text>Scan</Text></TouchableOpacity>
            : item.title === selectedTagType
              ? <TouchableOpacity
                  style={{
                    backgroundColor: "#aaa",
                    borderRadius: 30,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                  }}
                  disabled={true}
                ><Text>Scanned</Text></TouchableOpacity>
                    : <TouchableOpacity
                      style={{
                        backgroundColor: "#aaa",
                        borderRadius: 30,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                      }}
                      disabled={true}
                    ><Text>Switch To</Text></TouchableOpacity>
            }
        </View>
      );
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

    const NFCData = [
      {
        id: 1,
        title: "Passport or ID Card",
        handler: readPassport,
        enabled: false,
      },
      {
        id: 2,
        title: "NFC Tag",
        handler: readTag,
        enabled: true,
      },
      {
        id: 3,
        title: "Credit or Debit Card",
        handler: readCard,
        enabled: true,
      },
      {
        id: 4,
        title: "YubiKey",
        handler: readYubikey,
        enabled: true,
      },
    ];

    return (
      <OnboardingScreenContainer>
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
        <Text
          style={{
            color: isObi ? "#fff" : "#999CB6",
            fontSize: isSmallScreenNumber(12, 14),
            marginTop: 10,
          }}
        >
          Scan an NFC enabled device to create a key associated with your Obi
          Account.
        </Text>
        <Text
          style={{
            color: isObi ? "#fff" : "#999CB6",
            fontSize: isSmallScreenNumber(12, 14),
            marginTop: 20,
            fontWeight: "600",
          }}
        >
          Obi DOES NOT store sensitive information from credit cards or
          identification.
        </Text>
        {hasNfc ? (<View style={{ flex: 1, paddingVertical: isSmallScreenNumber(5, 10) }}>
          <FlatList
            data={NFCData}
            renderItem={({ item }) => (
              <ListItem item={item} onScanPress={() => {
                setSelectedTagType(item.title);
                item.handler();
              }} />
            )}
          />
        </View>) : null}
        <View
          style={{
            marginBottom: 20,
          }}
        >
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
            : scannedNFC
                ? (<Text
                  style={{
                    color: "#999CB6",
                    fontSize: 14,
                    marginTop: 10,
                    marginLeft: 30,
                    marginRight: 30,
                    marginBottom: 50,
                  }}>
                  <FormattedMessage
                    id="onboarding5.nfcunavailable"
                    defaultMessage={"You've labeled your NFC device as: " + selectedTagType + " " + wallet.nextAdmin.nfc?.publicKey.value}
                  />
                </Text>
                )
            : null }
          <VerifyAndProceedButton
            disabled={!scannedNFC}
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
          <TouchableOpacity
            style={{ alignItems: "center", paddingHorizontal: 15 }}
            onPress={function (): void {
              navigation.navigate(OnboardingRoute.CreateMultisigPhoneNumber);
            }}
          >
            <Text
              style={{
                color: "#437DFF",
                fontSize: isSmallScreenNumber(14, 14),
                fontWeight: "600",
                marginTop: 20,
              }}
            >
              Skip This Key
            </Text>
          </TouchableOpacity>
        </View>
      </OnboardingScreenContainer>
    );
  }
);
