import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const CloudKeyIcon = observer<SvgProps>(function CloudKeyIcon(props) {
  const theme = useTheme();
  return theme.style === "ztx" ? (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 20C4.96667 20 3.66667 19.4667 2.6 18.4C1.53333 17.3333 1 16.0333 1 14.5C1 13.2833 1.44583 12.2292 2.3375 11.3375C3.22917 10.4458 4.28333 10 5.5 10C6.71667 10 7.77083 10.4458 8.6625 11.3375C9.55417 12.2292 10 13.2833 10 14.5H12C12 12.7833 11.4667 11.3458 10.4 10.1875C9.33333 9.02917 7.95 8.3 6.25 8C6.55 6.76667 7.22917 5.79167 8.2875 5.075C9.34583 4.35833 10.5833 4 12 4C13.9667 4 15.625 4.675 16.975 6.025C18.325 7.375 19 9.03333 19 11C20.05 11 20.9792 11.4667 21.7875 12.4C22.5958 13.3333 23 14.3667 23 15.5C23 16.75 22.5625 17.8125 21.6875 18.6875C20.8125 19.5625 19.75 20 18.5 20H6.5Z"
        fill="#F6F8FC"
      />
    </Svg>
  ) : (
    <Svg width={20} height={20} fill="none" {...props}>
      <Path d="M5.5 16a3.5 3.5 0 0 1-.37-6.98 4 4 0 1 1 7.754-1.977A4.5 4.5 0 1 1 13.5 16h-8Z" />
    </Svg>
  );
});
