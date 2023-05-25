import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { ViewStyle } from "react-native";

import { IconButton } from "../buttons";
import { ChevronCircleLeftIcon } from "../icons";

export interface BackProps {
  style?: ViewStyle;
}

export const Back = observer(function Back({ style }: BackProps) {
  const { goBack } = useNavigation();

  return (
    <IconButton
      onPress={goBack}
      style={style}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <ChevronCircleLeftIcon />
    </IconButton>
  );
});
