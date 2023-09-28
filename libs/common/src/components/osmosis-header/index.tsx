import { useTheme } from "@emotion/react";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { Image, View } from "react-native";

import { IconButton } from "../buttons";
import { BackIcon } from "../icons";

export interface OsmosisHeaderProps {
  onBack?: () => void;
  onClose?: () => void;
  hideLogo?: boolean;
  hideBack?: boolean;
  hideClose?: boolean;
}

export const OsmosisHeader = observer<OsmosisHeaderProps>(
  function OsmosisHeader({ onBack, onClose, hideLogo, hideBack, hideClose }) {
    const navigation = useNavigation();
    const theme = useTheme();

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
          borderBottomColor: "#ffffff",
          ...theme.header,
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",

            height: "100%",
          }}
        >
          {!hideBack && (
            <IconButton
              onPress={onBackPress}
              style={{ ...theme.header?.backIcon }}
            >
              {theme.header?.backIcon?.src ? (
                <Image
                  resizeMode="contain"
                  source={{ uri: theme.header.backIcon.src }}
                  style={{
                    ...theme.header?.backIcon,
                  }}
                />
              ) : (
                <BackIcon width={8} height={16} />
              )}
            </IconButton>
          )}
        </View>
        {theme.header && !hideLogo ? (
          <Image
            resizeMode="contain"
            source={{ uri: theme.header.image.src }}
            style={{
              // width: theme.header.width,
              // height: theme.header.height,
              ...theme.header.image,
            }}
          />
        ) : null}
        <View style={{ width: 28 }}>
          {onClose && !hideClose ? (
            <IconButton
              onPress={onClose}
              style={{ width: 28 }}
              hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }}
            >
              {theme.header?.closeIcon ? (
                <Image
                  resizeMode="contain"
                  source={{ uri: theme.header.closeIcon.src }}
                  style={{
                    width: 12,
                    height: 12,
                    marginLeft: "auto",
                    ...theme.header?.closeIcon,
                  }}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  size={28}
                  color="#ffffff"
                />
              )}
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
  },
);
