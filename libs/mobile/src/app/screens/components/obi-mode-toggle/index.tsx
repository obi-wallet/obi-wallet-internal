import { Feature } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useState } from "react";
import { StyleProp, TouchableWithoutFeedback, ViewStyle } from "react-native";

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
        configStore.toggleBrand();
        setPressed(0);
      }
    }
  }, [configStore, pressed]);

  return (
    <TouchableWithoutFeedback
      {...props}
      onPress={() => {
        setPressed((pressed) => pressed + 1);
      }}
    />
  );
});
