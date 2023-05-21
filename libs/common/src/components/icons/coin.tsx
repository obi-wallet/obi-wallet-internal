import { observer } from "mobx-react-lite";
import { View } from "react-native";
import warning from "tiny-warning";

import { EnrichedToken } from "../../hooks";

const DefaultView = observer(function DefaultView() {
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    />
  );
});

export const CoinIcon = observer(function CoinIcon({
  source,
}: {
  source: EnrichedToken["icon"];
}) {
  warning(false, "CoinIcon not implemented for web");
  return <DefaultView />;
});
