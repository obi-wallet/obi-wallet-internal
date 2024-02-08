import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

export const ZtxPlatformRecoveryIcon = observer<SvgProps>(
  function ZtxPlatformRecoveryIcon(props: SvgProps) {
    return (
      <Svg width="20" height="17" viewBox="0 0 20 17" fill="none" {...props}>
        <Path
          d="M4.97823 13.0511H16.817C18.4844 13.0511 19.8367 14.4101 19.8374 16.0864H3.46939C0.204082 16.0864 0 14.3218 0 13.8294C0 13.2138 0.367347 12.3931 1.83673 11.4493L15.0204 3.03672H3.42857C1.76054 3.03672 0.408163 1.67704 0.408163 0H16.449C19.7143 0 19.8367 1.68251 19.8367 2.13391C19.8367 2.91361 19.551 3.73434 18.0816 4.67819L4.97823 13.0511Z"
          fill="#F6F8FC"
        />
      </Svg>
    );
  },
);
