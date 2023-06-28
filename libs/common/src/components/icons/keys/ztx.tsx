import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const ZtxPlatformRecoveryIcon = observer<SvgProps>(
  function ZtxPlatformRecoveryIcon(props: SvgProps) {
    return (
      <Svg viewBox="0 0 33 8" {...props}>
        <G data-name="Group 437">
          <G data-name="Layer 1">
            <G fill="#fff" data-name="Group 433">
              <Path
                d="M10.511 0h9.749a1.485 1.485 0 0 1-1.484 1.484h-2.648v4.895a1.485 1.485 0 0 1-1.484 1.484V1.484h-2.648A1.485 1.485 0 0 1 10.511 0Z"
                data-name="Path 192"
              />
              <Path
                d="M32.939 0h-1.852a1.485 1.485 0 0 0-.948.341L26.96 2.973 23.803.344a1.484 1.484 0 0 0-.95-.344h-1.89l4.825 3.932-4.865 3.932h1.894a1.485 1.485 0 0 0 .945-.339l3.2-2.635 3.2 2.635a1.488 1.488 0 0 0 .945.339h1.894l-4.868-3.932Z"
                data-name="Path 193"
              />
              <Path
                d="M2.447 6.38h5.818A1.485 1.485 0 0 1 9.75 7.864H1.705C.1 7.864 0 7 0 6.76c0-.3.181-.7.9-1.164l6.48-4.112h-5.7A1.485 1.485 0 0 1 .2 0h7.884c1.6 0 1.665.822 1.665 1.043 0 .381-.14.782-.863 1.244Z"
                data-name="Path 194"
              />
            </G>
          </G>
        </G>
      </Svg>
    );
  }
);
