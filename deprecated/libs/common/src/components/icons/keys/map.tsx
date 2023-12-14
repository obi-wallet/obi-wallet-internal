import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const MapKeyIcon = observer<SvgProps>(function MapKeyIcon(props) {
  return (
    <Svg width={24} height={24} {...props}>
      <G data-name="Interface-Essential / Select / cursor-target">
        <G
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          data-name="Group 702"
        >
          <Path d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" data-name="Oval 405" />
          <Path
            d="M12 16.5A4.5 4.5 0 1 0 7.5 12a4.5 4.5 0 0 0 4.5 4.5Z"
            data-name="Oval 406"
          />
          <Path d="M12 1v22" data-name="Shape 3337" />
          <Path d="M23 12H1" data-name="Shape 3338" />
        </G>
      </G>
    </Svg>
  );
});
