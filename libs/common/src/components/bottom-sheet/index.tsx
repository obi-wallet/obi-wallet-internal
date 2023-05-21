import type BottomSheetType from "@gorhom/bottom-sheet";
import type { BottomSheetProps as BaseBottomSheetProps } from "@gorhom/bottom-sheet";
import type { BottomSheetTextInputProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput/types";
import type { BottomSheetViewProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types";
import { observer } from "mobx-react-lite";
import { forwardRef, ReactNode, Ref } from "react";
import warning from "tiny-warning";

export type BottomSheet = BottomSheetType;

export interface BottomSheetProps {
  children: ReactNode;
  bottomSheetRef: Ref<BottomSheetType>;
  onClose?: () => void;
}

export const BaseBottomSheet = forwardRef<BottomSheet, BaseBottomSheetProps>(
  // eslint-disable-next-line mobx/no-anonymous-observer,mobx/missing-observer
  function BaseBottomSheet(props, ref) {
    warning(false, "BaseBottomSheet not implemented for web");
    return null;
  }
);

export const BottomSheet = observer<BottomSheetProps>(function BottomSheet() {
  warning(false, "BottomSheet not implemented for web");
  return null;
});

export const BottomSheetView = observer<BottomSheetViewProps>(
  function BottomSheetView() {
    warning(false, "BottomSheetView not implemented for web");
    return null;
  }
);

export const BottomSheetTextInput = observer<BottomSheetTextInputProps>(
  function BottomSheetTextInput() {
    warning(false, "BottomSheetTextInput not implemented for web");
    return null;
  }
);
