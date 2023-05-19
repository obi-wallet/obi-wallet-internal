import { observer } from "mobx-react-lite";
import { ScrollView } from "react-native";
import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-aware-scroll-view";

export const KeyboardAwareScrollView = observer<KeyboardAwareScrollViewProps>(
  function KeyboardAwareScrollView(props) {
    return <ScrollView {...props} />;
  }
);
