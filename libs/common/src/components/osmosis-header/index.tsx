import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { IconButton } from "../buttons";
import { BackIcon, OsmosisSmartAccountIcon } from "../icons";

export interface OsmosisHeaderProps {
  onBack?: () => void;
  onClose?: () => void;
}

export const OsmosisHeader = observer<OsmosisHeaderProps>(
  function OsmosisHeader({ onBack, onClose }) {
    const navigation = useNavigation();

    const onBackPress = getBackHandler();

    return (
      <View
        style={{
          paddingHorizontal: 20,
          marginVertical: 20,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View style={{ width: 29 }}>
          {onBackPress ? (
            <IconButton
              onPress={onBackPress}
              style={{ width: 29 }}
              hitSlop={{ top: 29, bottom: 29, left: 29, right: 29 }}
            >
              <BackIcon width={29} height={29} />
            </IconButton>
          ) : undefined}
        </View>
        <OsmosisSmartAccountIcon />
        <View style={{ width: 29 }}>
          {onClose ? (
            <IconButton
              onPress={onClose}
              style={{ width: 29 }}
              hitSlop={{ top: 29, bottom: 29, left: 29, right: 29 }}
            >
              <BackIcon width={29} height={29} />
            </IconButton>
          ) : undefined}
        </View>
      </View>
    );

    function getBackHandler() {
      if (typeof onBack === "function") {
        return onBack;
      }

      if (navigation.canGoBack()) {
        return () => {
          navigation.goBack();
        };
      }

      return undefined;
    }
  }
);
