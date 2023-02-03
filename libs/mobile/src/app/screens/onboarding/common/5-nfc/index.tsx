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
import NfcManager, {
  Ndef,
  NfcEvents,
  RegisterTagEventOpts,
} from "react-native-nfc-manager";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  checkIsSupported,
  decodeNdefRecord,
  getNFCKeyPair,
  parseNFCData,
  startReading,
} from "../../../../nfc";
import { useMultisigWallet, useStore } from "../../../../stores";
import { Back } from "../../../components/back";
import { Background } from "../../../components/background";
import { KeyboardAvoidingView } from "../../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../components/screen-size";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../onboarding-stack";
import PeopleIcon from "./assets/people-alt-twotone-24px.svg";
import { Sha256 } from "@cosmjs/crypto/build/sha";
import secp256k1 from "secp256k1";
import { prepareWalletAndOptionallySign } from "libs/mobile/src/app/secp256k1";
import invariant from "tiny-invariant";

export type MultisigNFCProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateMultisigNFC
>;

export const MultisigNFC = observer<MultisigNFCProps>(({ navigation }) => {
  const { chainStore, configStore } = useStore();
  const wallet = useMultisigWallet();
  const demoMode = isMultisigDemoWallet(wallet);
  const [hasNfc, setHasNFC] = useState(false);
  const [reading, setReading] = useState(false);
  const [parsed, setParsed] = useState("");
  const [scannedNFC, setScannedNFC] = useState(false);
  const [selectedTagType, setSelectedTagType] = useState("waiting...");
  const [address, setAddress] = useState("");
  const [passportModal, setPassportModal] = useState(false);
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Verify&Proceed Button disabled by default
  const [fetchingPubKey, setFetchingPubKey] = useState(false);
  const [passportNumber, setPassportNumber] = useState("");
  const [dob, setDob] = useState("");
  const [expiry, setExpiry] = useState("");
  const isObi = configStore.isObi();
  const isTerra = wallet.type === WalletType.TerraMultisig;
  const intl = useIntl();

  useEffect(() => {
    checkIsSupported().then((supported) => {
      setHasNFC(supported);
    });

    const { nfc } = wallet.nextAdmin;

    NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
      setReading(false);
      if ((await tag.ndefMessage) && (await tag.ndefMessage.length) > 0) {
        setParsed(await parseNFCData(tag));
        setScannedNFC(true);
      }
    });

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
              defaultMessage: "Create a new NFC key",
            }),
            style: "cancel",
          },
          {
            text: intl.formatMessage({
              id: "general.yes",
            }),
            onPress: () => {
              navigation.navigate(OnboardingRoute.CreateMultisigPhoneNumber);
            },
          },
        ]
      );
    }
  }, [intl, wallet, navigation]);

  const readYubikey = async () => {
    setReading(true);
    startReading(
      "Hold a YubiKey NFC near the top back of your phone to use it as entropy for a new deterministic keypair. No information is stored by Obi."
    );
  };

  const readCard = async () => {
    setReading(true);
    startReading(
      "Hold a credit, debit, or other card near the top back of your phone to use it as entropy for a new deterministic keypair. No information is stored by Obi."
    );
  };

  const readTag = async () => {
    setReading(true);
    startReading(
      "Hold an NFC Tag near the top back of your phone to use its information as entropy for a new deterministic keypair. No information is stored by Obi."
    );
  };

  const cancelReadTag = async () => {
    setReading(false);
    await NfcManager.unregisterTagEvent();
  };

  const readPassport = async () => {
    // todo
  };

  function ListItem({
    item,
    onScanPress,
  }: {
    item: { id: number; title: string; enabled: boolean };
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
        {!scannedNFC ? (
          <TouchableOpacity
            style={{
              backgroundColor: item.enabled ? "#fff" : "aaa",
              borderRadius: 30,
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
            onPress={onScanPress}
            disabled={!item.enabled}
          >
            {item.enabled ? <Text>Scan</Text> : <Text>Coming Soon</Text>}
          </TouchableOpacity>
        ) : item.title === selectedTagType ? (
          <TouchableOpacity
            style={{
              backgroundColor: "#aaa",
              borderRadius: 30,
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
            disabled={true}
          >
            <Text>Scanned</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: item.enabled ? "#fff" : "aaa",
              borderRadius: 30,
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
            disabled={!item.enabled}
            onPress={onScanPress}
          >
            {item.enabled ? <Text>Switch To</Text> : <Text>Coming Soon</Text>}
          </TouchableOpacity>
        )}
      </View>
    );
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
      enabled: false,
    },
  ];

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
                <Text
                  style={{
                    color: isObi ? "#fff" : "#999CB6",
                    fontSize: isSmallScreenNumber(12, 14),
                    marginTop: 10,
                  }}
                >
                  Scan an NFC enabled device to create a key associated with
                  your Obi Account.
                </Text>
                <Text
                  style={{
                    color: isObi ? "#fff" : "#999CB6",
                    fontSize: isSmallScreenNumber(12, 14),
                    marginTop: 20,
                    fontWeight: "600",
                  }}
                >
                  Obi CANNOT access or store sensitive information from credit
                  cards or identification.
                </Text>
                {hasNfc ? (
                  <View>
                    <FlatList
                      data={NFCData}
                      renderItem={({ item }) => (
                        <ListItem
                          item={item}
                          onScanPress={() => {
                            setSelectedTagType(item.title);
                            item.handler();
                          }}
                        />
                      )}
                    />
                  </View>
                ) : null}
                <View>
                  {!hasNfc ? (
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        marginTop: 10,
                      }}
                    >
                      <FormattedMessage
                        id="onboarding5.nfcunavailable"
                        defaultMessage="No NFC available on this device."
                      />
                    </Text>
                  ) : scannedNFC ? (
                    <Text
                      style={{
                        color: "#999CB6",
                        fontSize: 14,
                        marginTop: 10,
                        marginLeft: 10,
                        marginRight: 10,
                        marginBottom: 40,
                      }}
                    >
                      <FormattedMessage
                        id="onboarding5.nfctagtype"
                        defaultMessage={
                          "You've labeled your NFC device as: " +
                          selectedTagType +
                          ". This key is boosted with both local and remote brute force shields."
                        }
                      />
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
          <View
            style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}
          >
            <VerifyAndProceedButton
              disabled={!scannedNFC}
              onPress={async () => {
                if (scannedNFC) {
                  getNFCKeyPair({
                    demoMode,
                    parsed,
                    boostEntropy: true,
                    localEntropy: wallet.getLocalEntropy,
                  }).then((keypair) => {
                    const { privateKey, publicKey } = keypair;
                    wallet.setNFCPublicKey({
                      publicKey: {
                        type: pubkeyType.secp256k1,
                        value: publicKey,
                      },
                    }).then(() => {
                      prepareWalletAndOptionallySign({
                        publicKey,
                        privateKey,
                      });
                    });
                  });
                  if (wallet.keyInRecovery !== "nfc") {
                    navigation.navigate(
                      OnboardingRoute.CreateMultisigPhoneNumber
                    );
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
                {"Skip This Key"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});
