import { observer } from "mobx-react-lite";
import Svg, { Defs, G, Rect, SvgProps } from "react-native-svg";

export const BeneficiaryAccountIcon = observer<SvgProps>(
  function BeneficiaryAccountIcon(props) {
    return (
      <Svg width={59} height={65} {...props}>
        <Defs></Defs>
        <G data-name="Group 428">
          <G filter="url(#a)" transform="translate(.001)">
            <Rect
              width={25}
              height={35}
              fill="#437dff"
              data-name="Rectangle 327"
              rx={4}
              transform="translate(9 6)"
            />
          </G>
          <G filter="url(#b)" transform="translate(.001)">
            <Rect
              width={25}
              height={36}
              fill="#b6cbf9"
              data-name="Rectangle 328"
              opacity={0.896}
              rx={4}
              transform="translate(25 17)"
            />
          </G>
        </G>
      </Svg>
    );
  }
);
