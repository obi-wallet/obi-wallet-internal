import { Text } from "@obi-wallet/common";
import { useEffect, useState } from "react";
import { ScrollView, Share, TouchableOpacity } from "react-native";

import { useStore } from "../../src";

export default function WalletsSerializedData() {
  const { walletsStore } = useStore();
  const [serializedData, setSerializedData] = useState("");

  useEffect(() => {
    (async () => {
      const serializedData = await walletsStore.getSerializedData();
      setSerializedData(JSON.stringify(serializedData, null, 2));
    })();
  }, [walletsStore]);

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
