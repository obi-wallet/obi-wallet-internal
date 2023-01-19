import { FC, ReactNode } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgProps } from "react-native-svg";
import { SvgUri } from "react-native-svg";

import { createShadow } from "../styles";
import { Text } from "../typography";

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  tile: {
    width: "25%",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 7,
    ...createShadow(10),
  },
  icon: {
    width: "100%",
    height: "100%",
    borderRadius: 7,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    color: "#9C9BAB",
  },
});

export function Tiles({ children }: { children: ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

export interface TileProps {
  imgUrl?: string | null;
  ImgComponent?: FC<SvgProps>;
  source?: ImageSourcePropType;
  label: string;
  disabled?: boolean;
  onRemove?: () => void;
  onPress: () => void;
  onLongPress: () => void;
}

export function Tile({
  imgUrl,
  ImgComponent,
  source,
  label,
  disabled,
  onRemove,
  onPress,
  onLongPress,
}: TileProps) {
  const getImage = () => {
    if (source) {
      return <Image style={styles.icon} source={source} />;
    }

    if (imgUrl) {
      if (imgUrl.endsWith(".svg")) {
        return <SvgUri width="100%" height="100%" uri={imgUrl} />;
      }

      return (
        <Image
          style={styles.icon}
          source={{
            uri: imgUrl || "https://place-hold.it/180x180",
          }}
        />
      );
    }

    if (ImgComponent) {
      return <ImgComponent width="100%" height="100%" />;
    }

    return null;
  };
  const children = (
    <>
      <View style={[styles.iconContainer]}>
        {getImage()}
        {onRemove ? <RemoveButton onPress={onRemove} /> : null}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  const containerStyle = [styles.tile, { opacity: disabled ? 0.5 : 1 }];

  return onRemove ? (
    <View style={containerStyle}>{children}</View>
  ) : (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {children}
    </TouchableOpacity>
  );
}

const removeButtonStyles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: "#ffffff",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#000000",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#000000",
    fontSize: 10,
    textAlign: "center",
    textAlignVertical: "bottom",
  },
});

function RemoveButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={removeButtonStyles.button} onPress={onPress}>
      <Text style={removeButtonStyles.text}>✖</Text>
    </TouchableOpacity>
  );
}
