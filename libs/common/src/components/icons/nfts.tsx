import { observer } from "mobx-react-lite";
import Svg, {
  SvgProps,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

export const NftsIcon = observer(function NftsIcon(props: SvgProps) {
  return (
    <Svg width={29} height={29} fill="none" {...props}>
      <Path
        fill="#687599"
        d="m26.44 20.123-3.652-8.54c-.665-1.563-1.656-2.45-2.788-2.508-1.12-.058-2.205.723-3.033 2.217L14.75 15.27c-.467.84-1.132 1.342-1.855 1.4-.735.07-1.47-.315-2.065-1.073l-.257-.327c-.828-1.038-1.855-1.54-2.905-1.435-1.05.105-1.948.828-2.543 2.007l-2.018 4.025a4.635 4.635 0 0 0 .198 4.526 4.629 4.629 0 0 0 3.955 2.205h14.887a4.653 4.653 0 0 0 3.885-2.088 4.567 4.567 0 0 0 .408-4.387Z"
        opacity={0.4}
      />
      <Path
        fill="#687599"
        d="M8.882 10.277a3.943 3.943 0 1 0 0-7.887 3.943 3.943 0 0 0 0 7.887Z"
      />
    </Svg>
  );
});

export const NftsActiveIcon = observer(function NftsActiveIcon(
  props: SvgProps
) {
  return (
    <Svg width={28} height={28} fill="none" {...props}>
      <Path
        fill="#59D6E6"
        d="m25.69 19.623-3.652-8.54c-.665-1.563-1.656-2.45-2.788-2.508-1.12-.058-2.205.723-3.033 2.217L14 14.77c-.467.84-1.132 1.342-1.855 1.4-.735.07-1.47-.315-2.065-1.073l-.257-.327c-.828-1.038-1.855-1.54-2.905-1.435-1.05.105-1.948.828-2.543 2.007l-2.018 4.025a4.635 4.635 0 0 0 .198 4.526 4.629 4.629 0 0 0 3.955 2.205h14.887a4.653 4.653 0 0 0 3.885-2.088 4.567 4.567 0 0 0 .408-4.387Z"
      />
      <Path
        fill="url(#a)"
        d="m25.69 19.623-3.652-8.54c-.665-1.563-1.656-2.45-2.788-2.508-1.12-.058-2.205.723-3.033 2.217L14 14.77c-.467.84-1.132 1.342-1.855 1.4-.735.07-1.47-.315-2.065-1.073l-.257-.327c-.828-1.038-1.855-1.54-2.905-1.435-1.05.105-1.948.828-2.543 2.007l-2.018 4.025a4.635 4.635 0 0 0 .198 4.526 4.629 4.629 0 0 0 3.955 2.205h14.887a4.653 4.653 0 0 0 3.885-2.088 4.567 4.567 0 0 0 .408-4.387Z"
      />
      <G opacity={0.4}>
        <Path
          fill="#59D6E6"
          d="M8.132 9.777a3.943 3.943 0 1 0 0-7.887 3.943 3.943 0 0 0 0 7.887Z"
        />
        <Path
          fill="url(#b)"
          d="M8.132 9.777a3.943 3.943 0 1 0 0-7.887 3.943 3.943 0 0 0 0 7.887Z"
        />
      </G>
      <Defs>
        <LinearGradient
          id="a"
          x1={4.654}
          x2={23.089}
          y1={11.942}
          y2={23.038}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FCCFF7" />
          <Stop offset={0.253} stopColor="#E659D6" />
          <Stop offset={0.609} stopColor="#8877EA" />
          <Stop offset={0.951} stopColor="#86E2EE" />
        </LinearGradient>
        <LinearGradient
          id="b"
          x1={5.098}
          x2={11.974}
          y1={3.407}
          y2={6.403}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FCCFF7" />
          <Stop offset={0.253} stopColor="#E659D6" />
          <Stop offset={0.609} stopColor="#8877EA" />
          <Stop offset={0.951} stopColor="#86E2EE" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
});
