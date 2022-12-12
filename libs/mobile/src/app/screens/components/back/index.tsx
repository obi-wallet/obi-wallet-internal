import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { TouchableHighlight, ViewStyle } from "react-native";

import { IconButton } from "../../../button";
import { useStore } from "../../../stores";
import ChevronCircleLeft from "./assets/chevron-circle-left.svg";

export interface BackProps {
  style?: ViewStyle;
}

export const Back = observer(({ style }: BackProps) => {
  const { goBack } = useNavigation();
  const { settingsStore } = useStore();
  const isObi = settingsStore.isObi();

  return (
    <IconButton
      onPress={goBack}
      style={style}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      {isObi ? (
        <ChevronCircleLeft />
      ) : (
        <FontAwesomeIcon icon={faChevronLeft} style={{ color: "#7B87A8" }} />
      )}
    </IconButton>
  );
});
