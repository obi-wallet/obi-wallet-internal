import type { BottomSheetProps } from "@gorhom/bottom-sheet";
import type BottomSheetType from "@gorhom/bottom-sheet";
import type { BottomSheetViewProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";
import warning from "tiny-warning";

export type BottomSheet = BottomSheetType;

export const BottomSheet = forwardRef<BottomSheet, BottomSheetProps>(
  // eslint-disable-next-line mobx/no-anonymous-observer,mobx/missing-observer
  function BottomSheet(props, ref) {
    warning(false, "BottomSheet not implemented for web");
    return null;
  }
);

export const BottomSheetView = observer<BottomSheetViewProps>(
  function BottomSheetView() {
    warning(false, "BottomSheetView not implemented for web");
    return null;
  }
);
