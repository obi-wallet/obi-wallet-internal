import { useTheme } from "@emotion/react";
import { Brand, Text } from "@obi-wallet/common";
import { MultisigNFC, useStore } from "@obi-wallet/mobile";
import { useEffect } from "react";
import { View } from "react-native";

export default () => {
  const theme = useTheme();
  const { configStore } = useStore();
  useEffect(() => {
    configStore.setBrand(Brand.Obi);
  }, []);

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <MultisigNFC />
    </View>
  );
};
