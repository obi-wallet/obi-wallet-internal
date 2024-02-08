import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const WarningIcon = observer<SvgProps>(function WarningIcon(props) {
  return (
    <Svg width={16} height={15} fill="none" {...props}>
      <Path
        fill="#E3926B"
        fillRule="evenodd"
        d="M6.257 1.6C7.022.24 8.979.24 9.743 1.6l5.58 9.92c.75 1.333-.213 2.98-1.742 2.98H2.42c-1.53 0-2.493-1.647-1.743-2.98l5.58-9.92ZM9 11.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1Z"
        clipRule="evenodd"
      />
    </Svg>
  );
});
