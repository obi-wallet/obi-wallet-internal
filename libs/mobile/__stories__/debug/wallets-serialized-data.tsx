import { Text, useStore } from "@obi-wallet/common";
import { ScrollView, Share, TouchableOpacity } from "react-native";

export default function WalletsSerializedData() {
  const { walletsStore } = useStore();
  const serializedData = JSON.stringify(walletsStore.toJSON(), null, 2);

  return (
    <ScrollView>
      <TouchableOpacity
        onPress={() => {
          void Share.share({
            message: serializedData,
          });
        }}
      >
        <Text>{serializedData}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
