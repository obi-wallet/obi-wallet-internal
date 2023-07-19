import { observer } from "mobx-react-lite";
import Svg, { G, Path, SvgProps } from "react-native-svg";

export const NewSettingsIcon = observer<SvgProps>(
  function NewSettingsIcon(props) {
    return (
      <Svg width="16" height="16" viewBox="0 0 48 48" {...props}>
        <G fill="none" data-name="invisible box">
          <Path d="M0 0h48v48H0z" data-name="Rectangle 323" />
          <Path d="M0 0h48v48H0z" data-name="Rectangle 324" />
          <Path d="M0 0h48v48H0z" data-name="Rectangle 325" />
        </G>
        <G data-name="icons Q2">
          <Path
            fill="#fff"
            d="m40.2 29.2 5.5-1.5a23 23 0 0 0 0-7.4l-5.5-1.5a1.8 1.8 0 0 1-1.1-2.6l2.8-5a20.6 20.6 0 0 0-5.1-5.1l-5 2.8-.8.2a1.8 1.8 0 0 1-1.8-1.3l-1.5-5.5a23 23 0 0 0-7.4 0l-1.5 5.5A1.8 1.8 0 0 1 17 9.1l-.8-.2-5-2.8a20.6 20.6 0 0 0-5.1 5.1l2.8 5a1.8 1.8 0 0 1-1.1 2.6l-5.5 1.5a23 23 0 0 0 0 7.4l5.5 1.5a1.8 1.8 0 0 1 1.1 2.6l-2.8 5a20.6 20.6 0 0 0 5.1 5.1l5-2.8.8-.2a1.8 1.8 0 0 1 1.8 1.3l1.5 5.5a23 23 0 0 0 7.4 0l1.5-5.5a1.8 1.8 0 0 1 1.8-1.3l.8.2 5 2.8a20.6 20.6 0 0 0 5.1-5.1l-2.8-5a1.8 1.8 0 0 1 1.1-2.6ZM24 33a9 9 0 1 1 9-9 9 9 0 0 1-9 9Z"
            data-name="Path 210"
          />
        </G>
      </Svg>
    );
  },
);
