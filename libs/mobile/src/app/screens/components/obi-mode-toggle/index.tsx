import { Feature } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useState } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import { useStore } from "../../../stores";

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export interface BrandModeToggleProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const BrandToggle = observer<BrandModeToggleProps>((props) => {
  const [pressed, setPressed] = useState(0);
  const { configStore } = useStore();

  useEffect(() => {
    if (configStore.isFeatureEnabled(Feature.BrandToggle)) {
      if (pressed >= 5) {
      ReactNativeHapticFeedback.trigger("notificationSuccess", options);
        configStore.toggleBrand();
        setPressed(0);
      }
    }
  }, [configStore, pressed]);

  return (
    <Pressable
      {...props}
      onPress={() => {
        setPressed((pressed) => pressed + 1);
      }}
    />
  );
});
