import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import Svg, { SvgProps, G, Path } from "react-native-svg";

export const ObiFaceScannerIcon = observer<SvgProps>(
  function ObiFaceScannerIcon(props) {
    const theme = useTheme();

    return (
      <Svg viewBox="0 0 75.419 75.419" {...props}>
        <G data-name="Interface-Essential / FaceID / face-id">
          <G
            fill="none"
            stroke={theme.colors.primary}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={5}
            data-name="Group 98"
          >
            <Path
              d="M2.5 20.87v-9.185A9.185 9.185 0 0 1 11.685 2.5h9.185"
              data-name="Shape 614"
            />
            <Path
              d="M72.919 20.87v-9.185A9.185 9.185 0 0 0 63.734 2.5h-9.185"
              data-name="Shape 615"
            />
            <Path
              d="M2.5 54.549v9.185a9.184 9.184 0 0 0 9.185 9.185h9.185"
              data-name="Shape 616"
            />
            <Path
              d="M72.919 54.549v9.185a9.184 9.184 0 0 1-9.185 9.185h-9.185"
              data-name="Shape 617"
            />
            <Path
              d="M39.24 25.463v13.778a4.594 4.594 0 0 1-4.593 4.593h-1.53"
              data-name="Shape 618"
            />
            <Path d="M23.932 25.463v7.654" data-name="Shape 619" />
            <Path d="M54.549 25.463v7.654" data-name="Shape 620" />
            <Path
              d="M26.176 53.018a16.778 16.778 0 0 0 23.067 0"
              data-name="Shape 621"
            />
          </G>
        </G>
      </Svg>
    );
  }
);
