import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const LogoutIcon = observer<SvgProps>(function LogoutIcon(props) {
  const theme = useTheme();
  return theme.style === "ztx" ? (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H12V5H5V19H12V21H5ZM16 17L14.625 15.55L17.175 13H9V11H17.175L14.625 8.45L16 7L21 12L16 17Z"
        fill="#F6F8FC"
      />
    </Svg>
  ) : (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path d="M8.833.5H7.167v8.333h1.666V.5Zm4.025 1.808-1.183 1.184A5.767 5.767 0 0 1 13.833 8 5.829 5.829 0 0 1 8 13.833a5.829 5.829 0 0 1-3.683-10.35L3.142 2.308A7.444 7.444 0 0 0 .5 8a7.5 7.5 0 0 0 15 0 7.444 7.444 0 0 0-2.642-5.692Z" />
    </Svg>
  );
});
