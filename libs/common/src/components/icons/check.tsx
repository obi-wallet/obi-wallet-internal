import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const CheckIcon = observer(function CheckIcon(props: SvgProps) {
  return (
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
