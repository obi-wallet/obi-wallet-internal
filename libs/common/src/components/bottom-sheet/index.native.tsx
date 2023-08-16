import { useTheme } from "@emotion/react";
import OriginalBottomSheet, {
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { BlurView } from "@react-native-community/blur";
import { observer } from "mobx-react-lite";
import { ReactNode, Ref, useEffect, useRef } from "react";
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

export interface BottomSheetNewProps {
  open: boolean;
  onClose(): void;
  children: ReactNode;
}

export const BottomSheetNew = observer<BottomSheetNewProps>(
  function BottomSheetNew({ open, onClose, children }) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
      if (open) {
        bottomSheetRef.current?.expand();
      } else {
        bottomSheetRef.current?.close();
        onCloseRef.current();
      }
    }, [open]);

    return (
      <OriginalBottomSheet
        handleIndicatorStyle={{ backgroundColor: "white" }}
        backgroundStyle={{ backgroundColor: "#272727" }}
        handleStyle={{ backgroundColor: "transparent" }}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        ref={bottomSheetRef}
        index={-1}
      >
        <BottomSheetView
          style={{
            flex: 1,
            backgroundColor: "transparent",
            position: "relative",
          }}
        >
          {children}
        </BottomSheetView>
      </OriginalBottomSheet>
    );
  },
);

export interface BottomSheetProps {
  children: ReactNode;
  bottomSheetRef: Ref<OriginalBottomSheet>;
  onClose?: () => void;
}

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
