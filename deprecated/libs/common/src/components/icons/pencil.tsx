import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const PencilIcon = observer<SvgProps>(function PencilIcon(props) {
  return (
    <Svg width={19} height={19} {...props}>
      <G data-name="Layer 2">
        <G data-name="invisible box">
          <Path fill="none" d="M0 .001h19v19H0z" data-name="Rectangle 271" />
        </G>
        <G data-name="icons Q2">
          <Path
            fill="#fff"
            d="m17.144 7.465-5.57-5.609a.751.751 0 0 0-1.106 0l-8.651 8.651a.79.79 0 0 0-.237.553v5.568a.79.79 0 0 0 .79.79h5.57a.79.79 0 0 0 .553-.237l8.651-8.612a.751.751 0 0 0 0-1.106Zm-9.52 8.374H3.16v-4.463l4.938-4.9 4.424 4.464Zm6.044-6L9.204 5.371l1.817-1.857 4.464 4.5Z"
            data-name="Path 216"
          />
        </G>
      </G>
    </Svg>
  );
});
