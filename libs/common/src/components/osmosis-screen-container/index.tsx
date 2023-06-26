import { useTheme } from "@emotion/react";
import { BackgroundStyle } from "@obi-wallet/theme";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { View } from "react-native";

import { useOnClose } from "../../contexts";
import { OsmosisHeader, OsmosisHeaderProps } from "../osmosis-header";

export interface OsmosisScreenContainerProps
  extends Omit<OsmosisHeaderProps, "onClose"> {
  children: ReactNode;
  backgroundStyle?: BackgroundStyle;
}

const getBackgroundStyles = (style: BackgroundStyle) => {
  return {
    flex: 1,
    backgroundColor: style.color,
    backgroundSize: style.size,
    backgroundPosition: style.position,
    backgroundImage: style.image && `url(${style.image})`,
    backgroundBlendMode: style.blendMode,
  };
};
export const OsmosisScreenContainer = observer<OsmosisScreenContainerProps>(
  function OsmosisScreenContainer({ children, backgroundStyle, ...props }) {
    const theme = useTheme();
    const onClose = useOnClose();

    return (
      <View style={getBackgroundStyles(backgroundStyle ?? theme.background)}>
        <OsmosisHeader {...props} onClose={onClose} />
        <View>{children}</View>
      </View>
    );
  }
);
