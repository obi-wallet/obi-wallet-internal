import { Text } from "@obi-wallet/common";
import { ScrollView, Share, TouchableOpacity } from "react-native";

import { useStore } from "../../src";

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
        <Text style={{ color: "#ffffff" }}>{serializedData}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
