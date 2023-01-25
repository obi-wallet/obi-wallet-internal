import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { useStore } from "../../../../stores";
import { OnboardingScreenContainer } from "../../../components/onboarding-screen-container";
import { VerifyAndProceedButton } from "../../../components/phone-number/verify-and-proceed-button";
import { isSmallScreenNumber } from "../../../components/screen-size";

export const MultisigNFC = observer(() => {
  const { configStore } = useStore();
  const isObi = configStore.isObi();
  const [isScanning, setIsscanning] = useState(false);
  const NFCData = [
    {
      id: 1,
      title: "Passport or ID Card",
    },
    {
      id: 2,
      title: "NFC Tag",
    },
    {
      id: 3,
      title: "Credit or Debit Card",
    },
    {
      id: 4,
      title: "YubiKey",
    },
  ];
  useEffect(() => {
    if (isScanning) {
      Alert.alert("Scaning nfc modals whould be here");
      setIsscanning(false);
    }
  }, [isScanning]);

  return (
    <OnboardingScreenContainer>
      <Text
        style={{
          color: "#F6F5FF",
          fontSize: isSmallScreenNumber(20, 24),
          fontWeight: "600",
          marginTop: isSmallScreenNumber(20, 32),
        }}
      >
        Set an NFC Device Key
      </Text>
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
      <View style={{ flex: 1, paddingVertical: isSmallScreenNumber(5, 10) }}>
        <FlatList
          data={NFCData}
          renderItem={({ item }) => (
            <ListItem item={item} onScanPress={() => setIsscanning(true)} />
          )}
        />
      </View>
      <View
        style={{
          marginBottom: 20,
        }}
      >
        <VerifyAndProceedButton
          onPress={function (): void {
            Alert.alert("Not implemented");
          }}
        />
        <TouchableOpacity
          style={{ alignItems: "center", paddingHorizontal: 15 }}
          onPress={function (): void {
            Alert.alert("Not implemented");
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
});

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
      <TouchableOpacity
        style={{
          backgroundColor: "#fff",
          borderRadius: 30,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
        onPress={onScanPress}
      >
        <Text>Scan</Text>
      </TouchableOpacity>
    </View>
  );
}
