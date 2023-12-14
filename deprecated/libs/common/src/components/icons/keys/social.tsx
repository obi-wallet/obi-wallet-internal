import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path, G } from "react-native-svg";

export const SocialKeyIcon = observer<SvgProps>(function SocialKeyIcon(props) {
  return (
    <Svg viewBox="0 0 24 24" {...props}>
      <Path fill="none" d="M0 0h24v24H0Z" />
      <G fill="#fff">
        <Path
          d="M9 6a2 2 0 1 0 0 4 2 2 0 1 0 0-4ZM9 15c-2.7 0-5.8 1.29-6 2.01V18h12v-1c-.2-.71-3.3-2-6-2Z"
          opacity={0.3}
        />
        <Path d="M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87ZM15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24a5.98 5.98 0 0 1 0 7.52c.42.14.86.24 1.33.24ZM9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2ZM9 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4Zm6 5H3v-.99C3.2 16.29 6.3 15 9 15s5.8 1.29 6 2v1Z" />
      </G>
    </Svg>
  );
});
