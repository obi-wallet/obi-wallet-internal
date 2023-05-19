import { EnrichedToken } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { Image, View } from "react-native";
import { SvgUri } from "react-native-svg";

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

  if (typeof source === "function") {
    const Icon = source;
    return <Icon width={36} height={36} />;
  }

  if (typeof source === "object" && source.uri?.endsWith(".svg")) {
    return <SvgUri uri={source.uri} width={36} height={36} />;
  }

  return (
    <Image source={source} style={{ flex: 1, width: "100%", height: "100%" }} />
  );
});
