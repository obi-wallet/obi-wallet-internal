import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const HelpAndSupportIcon = observer<SvgProps>(
  function HelpAndSupportIcon(props) {
    return (
      <Svg width={16} height={20} fill="none" {...props}>
        <Path d="M8 .833a7.5 7.5 0 0 0-7.5 7.5v5.834c0 1.383 1.117 2.5 2.5 2.5h2.5V10H2.167V8.333A5.83 5.83 0 0 1 8 2.5a5.829 5.829 0 0 1 5.833 5.833V10H10.5v6.667h3.333v.833H8v1.667h5c1.383 0 2.5-1.117 2.5-2.5V8.333A7.5 7.5 0 0 0 8 .833Z" />
      </Svg>
    );
  }
);
