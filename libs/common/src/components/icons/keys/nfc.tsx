import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const NfcKeyIcon = observer<SvgProps>(function NfcKeyIcon(props) {
  return (
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
