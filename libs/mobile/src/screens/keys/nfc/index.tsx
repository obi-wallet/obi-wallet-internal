import { pubkeyType } from "@cosmjs/amino";
import { isSmallScreenNumber, Text, useStore } from "@obi-wallet/common";
import { MultisigKey, Sdk, Secp256k1KeyPair } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";
import NfcManager, { NfcEvents, OnDiscoverTag } from "react-native-nfc-manager";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAsyncEffect } from "rooks";

import {
  checkIsSupported,
  generateLocalEntropy,
  getNFCKeyPair,
  parseNFCData,
  startReading,
} from "../../../app/nfc";
import { useRootNavigation } from "../../../app/root-stack";
import { Back } from "../../../app/screens/components/back";
import { Background } from "../../../app/screens/components/background";
import { KeyboardAvoidingView } from "../../../app/screens/components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../app/screens/components/phone-number/verify-and-proceed-button";
import { OnboardingRoute } from "../../../app/screens/onboarding/onboarding-stack";
import { SettingsRoute } from "../../../app/screens/settings/settings-stack";
import { KeyFlow, KeyRoute, KeyStackParamList } from "../key-stack";

export type NfcKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.NfcKey
>;

export const NfcKeyScreen = observer<NfcKeyScreenProps>(function NfcKeyScreen({
  route,
}) {
  const navigation = useRootNavigation();
  const { params } = route;

  return (
    <NfcKey
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
});

export interface NfcKeyProps {
  draftId: string;
  demoMode: boolean;
  targetPublicKey?: string;

  onSubmit(): void;
}

export const NfcKey = observer<NfcKeyProps>(function NfcKey({
  draftId,
  demoMode,
  targetPublicKey,
  onSubmit,
}) {
  const { configStore, draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const intl = useIntl();
  const selectedTagType = useRef<string>("");
  const queryClient = useQueryClient();
  const [reading, setReading] = useState(false);

  const isObi = configStore.isObi();

  const [hasNfc, setHasNfc] = useState(false);
  const [scannedNfc, setScannedNfc] = useState(false);
  const [parsed, setParsed] = useState<{
    tagType: string;
    parsed: string;
  } | null>(null);

  // TODO: if target public key is passed, we are recovering an existing NFC key
  const isRecovering = typeof targetPublicKey === "string";

  useAsyncEffect(
    async () => {
      setHasNfc(await checkIsSupported());

      const onDiscoverTag: OnDiscoverTag = async (tag) => {
        setReading(false);
        if (tag.ndefMessage && tag.ndefMessage.length > 0) {
          setParsed({
            tagType: selectedTagType.current,
            parsed: parseNFCData(tag),
          });
          setScannedNfc(true);
          await NfcManager.unregisterTagEvent();
        }
      };

      NfcManager.setEventListener(NfcEvents.DiscoverTag, onDiscoverTag);
      NfcManager.setEventListener(NfcEvents.SessionClosed, async () => {
        setReading(false);
      });
      NfcManager.setEventListener(NfcEvents.StateChanged, () => {
        console.log("state changed");
      });
    },
    [intl],
    () => {
      NfcManager.unregisterTagEvent();
    }
  );

  const readYubikey = async () => {
    setReading(true);
    await startReading(
      "Hold a YubiKey NFC near the top back of your phone to use it as entropy for a new deterministic keypair. No information is stored by Obi."
    );
  };

  const readCard = async () => {
    setReading(true);
    await startReading(
      "Hold a credit, debit, or other card near the top back of your phone to use it as entropy for a new deterministic keypair. NOTE: some cards' NFC capabilities may be too weak for iOS devices. No information is stored by Obi."
    );
  };

  const readTag = async () => {
    setReading(true);
    await startReading(
      "Hold an NFC Tag near the top back of your phone to use its information as entropy for a new deterministic keypair. No information is stored by Obi."
    );
  };

  const readPassport = async () => {
    // TODO:
  };

  const nfcData = [
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
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: isSmallScreenNumber(20, 24),
                    fontWeight: "600",
                    marginTop: isSmallScreenNumber(20, 32),
                  }}
                >
                  Set up an NFC Key
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
                      data={nfcData}
                      renderItem={({ item }) => (
                        <ListItem
                          item={item}
                          onScanPress={() => {
                            selectedTagType.current = item.title;
                            item.handler();
                          }}
                          selectedTagType={selectedTagType.current}
                          scannedNfc={scannedNfc}
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
                  ) : parsed ? (
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
                          selectedTagType.current +
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
              disabled={!parsed}
              onPress={async () => {
                if (parsed) {
                  const localEntropy = generateLocalEntropy();
                  // TODO: should return keypair instead
                  const { publicKey, privateKey } = await getNFCKeyPair({
                    demoMode,
                    parsed: parsed.parsed,
                    boostEntropy: true,
                    localEntropy,
                  });
                  const keyPair: Secp256k1KeyPair = {
                    publicKey: {
                      type: pubkeyType.secp256k1,
                      value: publicKey,
                    },
                    privateKey,
                  };
                  draft.value.setNfcKey({
                    publicKey: keyPair.publicKey,
                    localEntropy,
                  });

                  void queryClient.prefetchQuery(
                    Sdk.chainId(
                      draft.value.chainId
                    ).transactions.prepareKeyPairQuery(keyPair)
                  );
                  onSubmit();
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
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});

const ListItem = observer(function ListItem({
  item,
  onScanPress,
  scannedNfc,
  selectedTagType,
}: {
  item: { id: number; title: string; enabled: boolean };
  scannedNfc: boolean;
  selectedTagType: string;
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
      {!scannedNfc ? (
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
          {item.enabled ? (
            <Text style={{ color: "#000" }}>Scan</Text>
          ) : (
            <Text style={{ color: "#fff" }}>Coming Soon</Text>
          )}
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
});
