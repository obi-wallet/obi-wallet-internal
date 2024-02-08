import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const NfcKeyIcon = observer<SvgProps>(function NfcKeyIcon(props) {
  const theme = useTheme();
  return theme.style === "ztx" ? (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 23V21H17V6H7V12H5V3C5 2.45 5.19583 1.97917 5.5875 1.5875C5.97917 1.19583 6.45 1 7 1H17C17.55 1 18.0208 1.19583 18.4125 1.5875C18.8042 1.97917 19 2.45 19 3V21C19 21.55 18.8042 22.0208 18.4125 22.4125C18.0208 22.8042 17.55 23 17 23H16ZM5 23V21C5.55 21 6.02083 21.1958 6.4125 21.5875C6.80417 21.9792 7 22.45 7 23H5ZM9 23C9 21.9 8.60833 20.9583 7.825 20.175C7.04167 19.3917 6.1 19 5 19V17C6.66667 17 8.08333 17.5833 9.25 18.75C10.4167 19.9167 11 21.3333 11 23H9ZM13 23C13 20.7667 12.225 18.875 10.675 17.325C9.125 15.775 7.23333 15 5 15V13C6.38333 13 7.68333 13.2625 8.9 13.7875C10.1167 14.3125 11.175 15.025 12.075 15.925C12.975 16.825 13.6875 17.8833 14.2125 19.1C14.7375 20.3167 15 21.6167 15 23H13Z"
        fill="#F6F8FC"
      />
    </Svg>
  ) : (
    <Svg width={23.633} height={26.613} {...props}>
      <G data-name="Group 415">
        <G data-name="Interface-Essential / Wireless / wifi-signal-1">
          <G
            fill="none"
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            data-name="Group 666"
          >
            <Path
              d="M2.91 9.892a4.814 4.814 0 0 0 0 6.808"
              data-name="Shape 3128"
            />
            <Path
              d="M17.499 2.121a15.817 15.817 0 0 1 0 22.371"
              data-name="Shape 3129"
            />
            <Path
              d="M13.604 5.999a10.315 10.315 0 0 1 0 14.589"
              data-name="Shape 3130"
            />
            <Path
              d="M9.718 9.892a4.814 4.814 0 0 1 0 6.808"
              data-name="Shape 3131"
            />
          </G>
        </G>
        <Path
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeWidth={3}
          d="m2.846 9.984 6.645 6.645"
          data-name="Line 18"
        />
      </G>
    </Svg>
  );
});
