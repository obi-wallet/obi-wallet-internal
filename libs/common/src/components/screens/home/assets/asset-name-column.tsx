import { useTheme } from "@emotion/react";
import { forwardRef } from "react";
import { FormattedMessage } from "react-intl";

import { Text } from "../../../typography";

const AssetNameColumn = forwardRef(() => {
  const theme = useTheme();
  return (
    <Text
      style={{
        color: "white",
        fontSize: theme.balance?.assetsHeader?.fontSize || 11,
        letterSpacing: 0.7,
        textTransform:
          theme.balance?.assetsHeader?.textTransform || "uppercase",
      }}
    >
      <FormattedMessage id="assets.name" defaultMessage="Name" />
    </Text>
  );
});

AssetNameColumn.displayName = "AssetNameColumn";
export { AssetNameColumn };
