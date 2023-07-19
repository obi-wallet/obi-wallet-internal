import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Defs, G, Circle } from "react-native-svg";

export const FlexAccountIcon = observer<SvgProps>(
  function FlexAccountIcon(props) {
    return (
      <Svg width={67.878} height={68.994} {...props}>
        <Defs></Defs>
        <G filter="url(#a)" transform="matrix(1 0 0 1 .006 -.002)">
          <Circle
            cx={17.556}
            cy={17.556}
            r={17.556}
            fill="none"
            stroke="#b7ccfa"
            strokeDasharray={65}
            strokeWidth={11}
            opacity={0.995}
            transform="rotate(-90 33.935 17.555)"
          />
        </G>
        <G filter="url(#b)" transform="matrix(1 0 0 1 .006 -.002)">
          <Circle
            cx={18.412}
            cy={18.412}
            r={18.412}
            fill="none"
            stroke="#437dff"
            strokeDasharray={90}
            strokeWidth={14}
            transform="rotate(80 16.921 35.425)"
          />
        </G>
      </Svg>
    );
  },
);
