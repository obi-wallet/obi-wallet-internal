import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const CheckIcon = observer(function CheckIcon(props: SvgProps) {
  const theme = useTheme();
  return theme.style === "ztx" ? (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.54998 18L3.84998 12.3L5.27498 10.875L9.54998 15.15L18.725 5.97498L20.15 7.39998L9.54998 18Z"
        fill="#CAA767"
      />
    </Svg>
  ) : (
    <Svg width={16} height={17} fill="none" {...props}>
      <Path
        fill="#89F5C2"
        fillRule="evenodd"
        d="M8 16.5A8 8 0 1 0 8 .499 8 8 0 0 0 8 16.5Zm3.707-9.293a1 1 0 0 0-1.414-1.414L7 9.086 5.707 7.793a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
        clipRule="evenodd"
      />
    </Svg>
  );
});
