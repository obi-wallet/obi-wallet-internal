import { Feature } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useState } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";

import { triggerNotificationSuccess } from "../../../../helpers/haptic-feedback";
import { useStore } from "../../../stores";

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
        triggerNotificationSuccess();
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
