import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { View } from "react-native";

import { useOnClose } from "../../contexts";
import { OsmosisHeader, OsmosisHeaderProps } from "../osmosis-header";

export interface OsmosisScreenContainerProps
  extends Omit<OsmosisHeaderProps, "onClose"> {
  children: ReactNode;
  backgroundImage?: string;
}

export const OsmosisScreenContainer = observer<OsmosisScreenContainerProps>(
  function OsmosisScreenContainer({ children, backgroundImage, ...props }) {
    const theme = useTheme();
    const onClose = useOnClose();
    const getBackgroundImage = () => {
      const baseImageStyles = {
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "luminosity",
      };
      if (backgroundImage) {
        return {
          ...baseImageStyles,
          backgroundImage: `url(${backgroundImage})`,
        };
      }
      if (theme.background.image) {
        return {
          ...baseImageStyles,
          backgroundImage: `url(${theme.background.image})`,
        };
      }
      return {};
    };

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background.color,
          ...getBackgroundImage(),
        }}
      >
        <OsmosisHeader {...props} onClose={onClose} />
        {children}
      </View>
    );
  }
);
