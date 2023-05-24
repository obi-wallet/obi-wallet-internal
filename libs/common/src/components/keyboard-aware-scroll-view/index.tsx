import { observer } from "mobx-react-lite";
import { FlatList, ScrollView } from "react-native";
import type {
  KeyboardAwareFlatListProps,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-aware-scroll-view";

export const KeyboardAwareScrollView = observer<KeyboardAwareScrollViewProps>(
  function KeyboardAwareScrollView(props) {
    return <ScrollView {...props} />;
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const KeyboardAwareFlatList = observer<KeyboardAwareFlatListProps<any>>(
  function KeyboardAwareFlatList(props) {
    return <FlatList {...props} />;
  }
);
