import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

import { useStore } from "../../src";

export default observer(function WalletsSerializedData() {
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
      <Text style={{ color: "#ffffff" }}>{serializedData}</Text>
    </ScrollView>
  );
});
