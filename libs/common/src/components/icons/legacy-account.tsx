import { observer } from "mobx-react-lite";
import Svg, { G, Path, SvgProps } from "react-native-svg";

export const LegacyAccountIcon = observer<SvgProps>(function LegacyAccountIcon(
  props: SvgProps,
) {
  return (
    <Svg width={60} height={58} {...props}>
      <G data-name="Group 429">
        <G filter="url(#a)">
          <Path
            fill="#437dff"
            d="M12.418 28.441a3 3 0 0 1 0-4.882l19.839-14.17A3 3 0 0 1 37 11.83v28.34a3 3 0 0 1-4.744 2.441Z"
            data-name="Polygon 3"
          />
        </G>
        <G filter="url(#b)">
          <Path
            fill="#b6cbf9"
            d="M26.418 28.441a3 3 0 0 1 0-4.882l19.839-14.17A3 3 0 0 1 51 11.83v28.34a3 3 0 0 1-4.744 2.441Z"
            data-name="Polygon 2"
            opacity={0.901}
          />
        </G>
      </G>
    </Svg>
  );
});
