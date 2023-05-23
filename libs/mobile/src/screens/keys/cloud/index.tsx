import { pubkeyType } from "@cosmjs/amino";
import {
  Alert,
  Back,
  Background,
  isSmallScreenNumber,
  KeyboardAvoidingView,
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  OnboardingRoute,
  SettingsRoute,
  Text,
  useRootNavigation,
  useStore,
} from "@obi-wallet/common";
import { MultisigKey, Sdk, Secp256k1KeyPair } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCloudKeyPair, signOut } from "../../../app/cloud/google-drive";

export type CloudKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.CloudKey
>;

export const CloudKeyScreen = observer<CloudKeyScreenProps>(
  function CloudKeyScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    return (
      <CloudKey
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

export interface CloudKeyProps {
  draftId: string;
  demoMode: boolean;
  targetPublicKey?: string;

  onSubmit(): void;
}

export const CloudKey = observer<CloudKeyProps>(function CloudKey({
  draftId,
  demoMode,
  targetPublicKey,
  onSubmit,
}) {
  const { configStore, draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const selectedTagType = useRef("");
  const queryClient = useQueryClient();
  const isObi = configStore.isObi();

  const isRecovering = typeof targetPublicKey === "string";

  const handleGoogleDrive = async () => {
    await signOut();
    // TODO: should return keypair instead
    const { publicKey, privateKey } = await getCloudKeyPair({
      demoMode: demoMode,
    });
    const keyPair: Secp256k1KeyPair = {
      publicKey: {
        type: pubkeyType.secp256k1,
        value: publicKey,
      },
      privateKey,
    };

    if (isRecovering) {
      if (targetPublicKey === publicKey) {
        draft.value.setCloudKey({
          provider: "google-drive",
          ...keyPair,
        });
      } else {
        Alert.alert(
          "Error",
          "We could not find the key with that cloud provider / account combination."
        );
      }
    } else {
      draft.value.setCloudKey({
        provider: "google-drive",
        ...keyPair,
      });
    }

    void queryClient.prefetchQuery(
      Sdk.chainId(draft.value.chainId).transactions.prepareKeyPairQuery(keyPair)
    );
    onSubmit();
  };

  const cloudData = [
    {
      id: "google-drive",
      title: "Google Drive",
      handler: handleGoogleDrive,
      enabled: true,
    },
    {
      id: "icloud",
      title: "iCloud",
      handler: () => {
        // noop
      },
      enabled: false,
    },
    {
      id: "dropbox",
      title: "Dropbox",
      handler: () => {
        // noop
      },
      enabled: false,
    },
    {
      id: "one-drive",
      title: "OneDrive",
      handler: () => {
        // noop
      },
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
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: isSmallScreenNumber(20, 24),
                    fontWeight: "600",
                    marginTop: isSmallScreenNumber(20, 32),
                  }}
                >
                  {isRecovering
                    ? "Recover your Cloud Key"
                    : "Set up a Cloud Key"}
                </Text>
                <Text
                  style={{
                    color: isObi ? "#fff" : "#999CB6",
                    fontSize: isSmallScreenNumber(12, 14),
                    marginTop: 10,
                  }}
                >
                  {isRecovering
                    ? "Import your key from the cloud"
                    : "Generate a key and save it to the cloud."}
                </Text>
                <FlatList
                  data={cloudData}
                  renderItem={({ item }) => (
                    <ListItem
                      item={item}
                      onScanPress={() => {
                        selectedTagType.current = item.title;
                        item.handler();
                      }}
                      selectedTagType={selectedTagType.current}
                      scannedNfc={false}
                    />
                  )}
                />
              </View>
            </View>
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
  item: { id: string; title: string; enabled: boolean };
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
            <Text style={{ color: "#000" }}>Select</Text>
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
