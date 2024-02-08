import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const LedgerKeyIcon = observer(function LedgerKeyIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} {...props}>
      <G fill="#fff" data-name="Group 416">
        <Path d="M9 0h11a4 4 0 0 1 4 4v11H9V0Z" data-name="Rectangle 300" />
        <Path d="M4 0h2v6H0V4a4 4 0 0 1 4-4Z" data-name="Rectangle 301" />
        <Path d="M0 9h6v6H0z" data-name="Rectangle 304" />
        <Path d="M9 18h6v6H9z" data-name="Rectangle 305" />
        <Path d="M0 18h6v6H4a4 4 0 0 1-4-4v-2Z" data-name="Rectangle 302" />
        <Path d="M18 18h6v2a4 4 0 0 1-4 4h-2v-6Z" data-name="Rectangle 303" />
      </G>
    </Svg>
  );
});
