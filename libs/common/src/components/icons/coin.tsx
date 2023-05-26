import { observer } from "mobx-react-lite";
import { Image, View } from "react-native";
import invariant from "tiny-invariant";

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
  if (typeof source !== "object" || !source?.uri) {
    invariant(false, "URI must be defined for web");
    return <DefaultView />;
  }

  return (
    <Image source={source} style={{ flex: 1, width: "100%", height: "100%" }} />
  );
});
