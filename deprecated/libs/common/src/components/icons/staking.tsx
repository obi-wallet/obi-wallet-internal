import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const StakingIcon = observer<SvgProps>(function StakingIcon(props) {
  return (
    <Svg width={22} height={22} {...props}>
      <G data-name="Layer 2">
        <G data-name="invisible box">
          <Path fill="none" d="M0 0h22v22H0z" data-name="Rectangle 276" />
        </G>
        <G data-name="icons Q2">
          <Path
            fill="#fff"
            d="m19.329 5.446-2.246-3.01a1.8 1.8 0 0 0-1.438-.719H5.761a1.8 1.8 0 0 0-1.438.719l-2.247 3.01a1.842 1.842 0 0 0-.359 1.078v11.367a1.8 1.8 0 0 0 1.8 1.8h14.374a1.8 1.8 0 0 0 1.8-1.8V6.524a1.842 1.842 0 0 0-.359-1.078ZM5.761 3.517h9.884l2.022 2.7H3.739Zm12.13 14.374H3.517V8.007h6.29v5.032l-1.168-1.168a.854.854 0 0 0-1.348.09.943.943 0 0 0 .09 1.213l2.7 2.651a.854.854 0 0 0 1.258 0l2.7-2.651a.943.943 0 0 0 .09-1.213.854.854 0 0 0-1.348-.09l-1.168 1.168V8.007h6.29Z"
            data-name="Path 219"
          />
        </G>
      </G>
    </Svg>
  );
});
