import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const CloudKeyIcon = observer<SvgProps>(function CloudKeyIcon(props) {
  return (
    <Svg width={20} height={20} fill="none" {...props}>
      <Path d="M5.5 16a3.5 3.5 0 0 1-.37-6.98 4 4 0 1 1 7.754-1.977A4.5 4.5 0 1 1 13.5 16h-8Z" />
    </Svg>
  );
});
