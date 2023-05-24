import { useTheme } from "@emotion/react";
import OriginalBottomSheet, {
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { BlurView } from "@react-native-community/blur";
import { observer } from "mobx-react-lite";
import { ReactNode, Ref } from "react";
import {
  Platform,
  StyleProp,
  TouchableOpacity,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type BottomSheet = OriginalBottomSheet;

export { BottomSheetView, BottomSheetTextInput };

export interface BottomSheetProps {
  children: ReactNode;
  bottomSheetRef: Ref<OriginalBottomSheet>;
  onClose?: () => void;
}

export const BaseBottomSheet = OriginalBottomSheet;

export const BottomSheet = observer(function BottomSheet({
  children,
  onClose,
  bottomSheetRef,
}: BottomSheetProps) {
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <OriginalBottomSheet
      handleIndicatorStyle={{ backgroundColor: "#FFFFFF" }}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleStyle={{ backgroundColor: "transparent" }}
      snapPoints={["50%"]}
      enablePanDownToClose={true}
      ref={bottomSheetRef}
      onClose={onClose}
      index={-1}
    >
      <BottomSheetView
        style={{
          flex: 1,
          backgroundColor: "transparent",
          position: "relative",
          marginBottom: safeArea.bottom,
        }}
      >
        {children}
      </BottomSheetView>
    </OriginalBottomSheet>
  );
});

export interface BottomSheetBackdropProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  visible: boolean;
}

export const BottomSheetBackdrop = observer(function BottomSheetBackdrop({
  style,
  onPress,
  visible,
}: BottomSheetBackdropProps) {
  const dimensions = useWindowDimensions();
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[
        {
          flex: 1,
          position: "absolute",
          height: dimensions.height,
          width: dimensions.width,
          right: 0,
          left: 0,
        },
        style,
      ]}
      onPress={() => {
        onPress();
      }}
    >
      {Platform.OS === "ios" ? (
        <BlurView style={{ flex: 1 }} blurAmount={0} />
      ) : null}
    </TouchableOpacity>
  );
});
