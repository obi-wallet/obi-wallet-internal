import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const ObiAppsIcon = observer<SvgProps>(function ObiApps(props) {
  return (
    <Svg width={30} height={30} {...props}>
      <G data-name="Interface-Essential / Dashboard / layout-dashboard">
        <G
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          data-name="Group 18"
        >
          <Path
            d="M.75 21.815a1.24 1.24 0 0 1 1.239-1.239h9.913a1.24 1.24 0 0 1 1.239 1.239v6.2a1.24 1.24 0 0 1-1.239 1.239H1.989A1.24 1.24 0 0 1 .75 28.015Z"
            data-name="Rectangle-path 7"
          />
          <Path
            d="M29.25 28.011a1.24 1.24 0 0 1-1.239 1.239h-9.913a1.24 1.24 0 0 1-1.239-1.239v-13.63a1.24 1.24 0 0 1 1.239-1.239h9.913a1.24 1.24 0 0 1 1.239 1.239Z"
            data-name="Rectangle-path 8"
          />
          <Path
            d="M29.25 8.185a1.24 1.24 0 0 1-1.239 1.239h-9.913a1.24 1.24 0 0 1-1.239-1.239v-6.2A1.24 1.24 0 0 1 18.098.746h9.913a1.24 1.24 0 0 1 1.239 1.239Z"
            data-name="Rectangle-path 9"
          />
          <Path
            d="M.75 1.989A1.24 1.24 0 0 1 1.989.75h9.913a1.24 1.24 0 0 1 1.239 1.239v13.63a1.24 1.24 0 0 1-1.239 1.239H1.989A1.24 1.24 0 0 1 .75 15.619Z"
            data-name="Rectangle-path 10"
          />
        </G>
      </G>
    </Svg>
  );
});

export const ObiAppsActiveIcon = observer<SvgProps>(function ObiAppsActiveIcon(
  props
) {
  return (
    <Svg width={30} height={30} {...props}>
      <G data-name="Interface-Essential / Dashboard / layout-dashboard">
        <G
          fill="#fff"
          stroke="#437dff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          data-name="Group 18"
        >
          <Path
            d="M.75 21.815a1.24 1.24 0 0 1 1.239-1.239h9.913a1.24 1.24 0 0 1 1.239 1.239v6.2a1.24 1.24 0 0 1-1.239 1.239H1.989A1.24 1.24 0 0 1 .75 28.015Z"
            data-name="Rectangle-path 7"
          />
          <Path
            d="M29.25 28.011a1.24 1.24 0 0 1-1.239 1.239h-9.913a1.24 1.24 0 0 1-1.239-1.239v-13.63a1.24 1.24 0 0 1 1.239-1.239h9.913a1.24 1.24 0 0 1 1.239 1.239Z"
            data-name="Rectangle-path 8"
          />
          <Path
            d="M29.25 8.185a1.24 1.24 0 0 1-1.239 1.239h-9.913a1.24 1.24 0 0 1-1.239-1.239v-6.2A1.24 1.24 0 0 1 18.098.746h9.913a1.24 1.24 0 0 1 1.239 1.239Z"
            data-name="Rectangle-path 9"
          />
          <Path
            d="M.75 1.989A1.24 1.24 0 0 1 1.989.75h9.913a1.24 1.24 0 0 1 1.239 1.239v13.63a1.24 1.24 0 0 1-1.239 1.239H1.989A1.24 1.24 0 0 1 .75 15.619Z"
            data-name="Rectangle-path 10"
          />
        </G>
      </G>
    </Svg>
  );
});
