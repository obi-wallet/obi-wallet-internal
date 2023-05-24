import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const LogoutIcon = observer<SvgProps>(function LogoutIcon(props) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path d="M8.833.5H7.167v8.333h1.666V.5Zm4.025 1.808-1.183 1.184A5.767 5.767 0 0 1 13.833 8 5.829 5.829 0 0 1 8 13.833a5.829 5.829 0 0 1-3.683-10.35L3.142 2.308A7.444 7.444 0 0 0 .5 8a7.5 7.5 0 0 0 15 0 7.444 7.444 0 0 0-2.642-5.692Z" />
    </Svg>
  );
});
