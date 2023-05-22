import { observer } from "mobx-react-lite";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  SvgProps,
} from "react-native-svg";

export const AssetsIcon = observer<SvgProps>(function AssetsIcon(props) {
  return (
    <Svg width={28} height={28} fill="none" {...props}>
      <Path
        fill="#687599"
        d="M25.667 9.917a7.583 7.583 0 0 1-8.19 7.56 7.594 7.594 0 0 0-6.954-6.954 7.583 7.583 0 1 1 15.143-.607Z"
        opacity={0.4}
      />
      <Path
        fill="#687599"
        d="M17.5 18.083a7.583 7.583 0 1 1-15.167 0 7.583 7.583 0 1 1 15.167 0Z"
      />
      <Path
        fill="#100F1E"
        d="m8.89 17.057 1.027-1.89 1.026 1.89 1.89 1.026-1.89 1.027L9.917 21 8.89 19.11 7 18.083l1.89-1.026Z"
      />
    </Svg>
  );
});

export const AssetsActiveIcon = observer<SvgProps>(function AssetsActiveIcon(
  props
) {
  return (
    <Svg width={28} height={28} fill="none" {...props}>
      <Path
        fill="url(#a)"
        d="M25.667 9.917a7.583 7.583 0 0 1-8.19 7.56 7.594 7.594 0 0 0-6.954-6.954 7.583 7.583 0 1 1 15.143-.607Z"
        opacity={0.4}
      />
      <Path
        fill="#59D6E6"
        d="M17.5 18.083a7.583 7.583 0 1 1-15.167 0 7.583 7.583 0 1 1 15.167 0Z"
      />
      <Path
        fill="url(#b)"
        d="M17.5 18.083a7.583 7.583 0 1 1-15.167 0 7.583 7.583 0 1 1 15.167 0Z"
      />
      <Path
        fill="#100F1E"
        d="m8.89 17.057 1.027-1.89 1.026 1.89 1.89 1.026-1.89 1.027L9.917 21 8.89 19.11 7 18.083l1.89-1.026Z"
      />
      <Defs>
        <LinearGradient
          id="a"
          x1={12.25}
          x2={25.473}
          y1={5.25}
          y2={11.012}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FCCFF7" />
          <Stop offset={0.253} stopColor="#E659D6" />
          <Stop offset={0.609} stopColor="#8877EA" />
          <Stop offset={0.951} stopColor="#86E2EE" />
        </LinearGradient>
        <LinearGradient
          id="b"
          x1={4.083}
          x2={17.306}
          y1={13.417}
          y2={19.179}
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
