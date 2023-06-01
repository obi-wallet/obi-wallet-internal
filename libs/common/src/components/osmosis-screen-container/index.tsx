import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { View } from "react-native";

import { OsmosisHeader, OsmosisHeaderProps } from "../osmosis-header";

export interface OsmosisScreenContainerProps extends OsmosisHeaderProps {
  children: ReactNode;
}

export const OsmosisScreenContainer = observer<OsmosisScreenContainerProps>(
  function OsmosisScreenContainer({ children, ...props }) {
    const theme = useTheme();

    return (
      <View
        style={{
          flex: 1,
          // @ts-expect-error works in web
          backgroundImage: theme.background.image
            ? `url(${theme.background.image})`
            : undefined,
          backgroundColor: theme.background.color,
        }}
      >
        <OsmosisHeader {...props} />
        {children}
      </View>
    );
  }
);
