import { useTheme } from "@emotion/react";
import OriginalBottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { observer } from "mobx-react-lite";
import { ReactNode, Ref } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface BottomSheetProps {
  children: ReactNode;
  bottomSheetRef: Ref<OriginalBottomSheet>;
  onClose?: () => void;
}

export type BottomSheetRef = OriginalBottomSheet;

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
