import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const ObiAssetsIcon = observer<SvgProps>(function ObiAssetsIcon(props) {
  return (
    <Svg width={31.5} height={30.747} {...props}>
      <G data-name="Money-Payments-Finance / Money / money-wallet-open">
        <G
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          data-name="Group 27"
        >
          <Path
            d="m1.794 1.993 17.34 4.329a5.285 5.285 0 0 1 3.79 4.863v15.652a2.964 2.964 0 0 1-3.809 3.016L4.564 26.43A5.2 5.2 0 0 1 .75 21.62V4.663A3.925 3.925 0 0 1 4.663.75h22.174a3.923 3.923 0 0 1 3.913 3.913v14.348a3.923 3.923 0 0 1-3.913 3.913h-3.913"
            data-name="Shape 215"
          />
          <Path d="M12.49 4.658h13.043" data-name="Shape 216" />
          <Path
            d="M17.06 20.315a2.609 2.609 0 1 0-2.613-2.608 2.608 2.608 0 0 0 2.613 2.608Z"
            data-name="Oval 12"
          />
          <Path d="M22.925 11.18h2.609" data-name="Shape 217" />
        </G>
      </G>
    </Svg>
  );
});

export const ObiAssetsActiveIcon = observer<SvgProps>(
  function ObiAssetsActiveIcon(props) {
    return (
      <Svg width={31.5} height={30.747} {...props}>
        <G data-name="Money-Payments-Finance / Money / money-wallet-open">
          <G
            fill="#fff"
            stroke="#437dff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            data-name="Group 27"
          >
            <Path
              d="m1.794 1.993 17.34 4.329a5.285 5.285 0 0 1 3.79 4.863v15.652a2.964 2.964 0 0 1-3.809 3.016L4.564 26.43A5.2 5.2 0 0 1 .75 21.62V4.663A3.925 3.925 0 0 1 4.663.75h22.174a3.923 3.923 0 0 1 3.913 3.913v14.348a3.923 3.923 0 0 1-3.913 3.913h-3.913"
              data-name="Shape 215"
            />
            <Path d="M12.49 4.658h13.043" data-name="Shape 216" />
            <Path
              d="M17.06 20.315a2.609 2.609 0 1 0-2.613-2.608 2.608 2.608 0 0 0 2.613 2.608Z"
              data-name="Oval 12"
            />
            <Path d="M22.925 11.18h2.609" data-name="Shape 217" />
          </G>
        </G>
      </Svg>
    );
  },
);
