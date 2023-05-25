import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const ChevronCircleLeftIcon = observer<SvgProps>(
  function ChevronCircleLeftIcon(props) {
    return (
      <Svg width={29} height={29} data-name="Layer 2" {...props}>
        <G data-name="invisible box">
          <Path fill="none" d="M0 0h29v29H0z" data-name="Rectangle 226" />
        </G>
        <G fill="#fff" data-name="icons Q2">
          <Path
            d="M25.384 14.509A10.879 10.879 0 1 1 14.509 3.626a10.879 10.879 0 0 1 10.875 10.883m2.417 0a13.236 13.236 0 1 0-3.877 9.42 13.3 13.3 0 0 0 3.877-9.42Z"
            data-name="Path 190"
          />
          <Path
            d="m13.176 14.505 3.989 3.989a1.148 1.148 0 0 1-.121 1.813 1.269 1.269 0 0 1-1.632-.121l-4.775-4.835a1.148 1.148 0 0 1 0-1.692l4.775-4.835a1.269 1.269 0 0 1 1.632-.121 1.148 1.148 0 0 1 .121 1.813Z"
            data-name="Path 191"
          />
        </G>
      </Svg>
    );
  }
);
