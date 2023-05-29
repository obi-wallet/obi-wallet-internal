import { observer } from "mobx-react-lite";
import { Image, View } from "react-native";
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
  if (!source) return <DefaultView />;

  if (typeof source !== "object" || !source?.uri) {
    warning(false, "URI must be defined for web");
    return <DefaultView />;
  }

  return (
    <Image source={source} style={{ flex: 1, width: "100%", height: "100%" }} />
  );
});
