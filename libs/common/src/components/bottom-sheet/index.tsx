import { useTheme } from "@emotion/react";
import type BottomSheetType from "@gorhom/bottom-sheet";
import type { BottomSheetProps as BaseBottomSheetProps } from "@gorhom/bottom-sheet";
import type { BottomSheetTextInputProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput/types";
import type { BottomSheetViewProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types";
import { observer } from "mobx-react-lite";
import {
  createContext,
  forwardRef,
  MutableRefObject,
  ReactNode,
  Ref,
  useContext,
} from "react";
import Sheet from "react-modal-sheet";
import { FullWindowOverlay } from "react-native-screens";
import warning from "tiny-warning";

export const BottomSheetContainerContext = createContext<
  MutableRefObject<HTMLDivElement | null>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
>(null!);

export interface BottomSheetNewProps {
  open: boolean;
  onClose(): void;
  children: ReactNode;
}

export const BottomSheetNew = observer<BottomSheetNewProps>(
  function BottomSheetNew({ open, onClose, children }) {
    const theme = useTheme();
    const containerRef = useContext(BottomSheetContainerContext);

    if (!containerRef.current) return null;

    return (
      <FullWindowOverlay>
        <Sheet
          isOpen={open}
          onClose={onClose}
          mountPoint={containerRef.current}
          snapPoints={[0.5]}
        >
          <Sheet.Container
            style={{
              backgroundColor: theme.colors.background,
            }}
          >
            <Sheet.Header />
            <Sheet.Content>{children}</Sheet.Content>
          </Sheet.Container>

          {/* @ts-expect-error `onClick` exists according to documentation */}
          <Sheet.Backdrop onClick={onClose} />
        </Sheet>
      </FullWindowOverlay>
    );
  }
);

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
