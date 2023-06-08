import { Platform } from "react-native";

import { CommonTheme } from "./abstract";

const fontWeights = {
  bold: Platform.select({
    android: "bold" as const,
    default: "600" as const,
  }),
};

export const common: CommonTheme = {
  // 4dp grid
  spacing: {
    0: 0,
    4: 4,
    8: 8,
    12: 12,
    16: 16,
    24: 24,
    32: 32,
    64: 64,
    72: 72,
    128: 128,
  },
  typography: {
    largeTitle: {
      fontSize: 34,
      fontWeight: fontWeights.bold,
    },
    title1: {
      fontSize: 28,
    },
    title2: {
      fontSize: 22,
    },
    title3: {
      fontSize: 20,
    },
    headline: {
      fontSize: 17,
    },
    body: {
      fontSize: 17,
    },
    callout: {
      fontSize: 16,
    },
    subhead: {
      fontSize: 15,
    },
    footnote: {
      fontSize: 13,
    },
    caption1: {
      fontSize: 12,
    },
    caption2: {
      fontSize: 11,
    },
  },
  fontWeights,
};
