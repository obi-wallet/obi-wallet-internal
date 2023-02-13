import { Platform } from "react-native";

export function createShadow(shadowRadius: number, opacity = 0.5) {
  return {
    ...Platform.select({
      android: {
        elevation: shadowRadius,
      },
      default: {
        shadowColor: "#000000",
        shadowRadius,
        shadowOpacity: opacity,
      },
    }),
  };
}
