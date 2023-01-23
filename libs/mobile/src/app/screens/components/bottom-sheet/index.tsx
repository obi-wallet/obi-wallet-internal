import { useTheme } from "@emotion/react";
import OriginalBottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { ReactNode, Ref } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface BottomSheetProps {
  children: ReactNode;
  bottomSheetRef: Ref<OriginalBottomSheet>;
}

export type BottomSheetRef = OriginalBottomSheet;

export function BottomSheet({ children, bottomSheetRef }: BottomSheetProps) {
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
}
