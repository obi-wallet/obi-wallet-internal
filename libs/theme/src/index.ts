import { Platform, TextStyle } from "react-native";

export interface CommonTheme {
  spacing: {
    0: 0;
    4: 4;
    8: 8;
    12: 12;
    16: 16;
    24: 24;
    32: 32;
    64: 64;
    72: 72;
    128: 128;
  };

  typography: {
    largeTitle: TextStyle;
    title1: TextStyle;
    title2: TextStyle;
    title3: TextStyle;
    headline: TextStyle;
    body: TextStyle;
    callout: TextStyle;
    subhead: TextStyle;
    footnote: TextStyle;
    caption1: TextStyle;
    caption2: TextStyle;
  };

  fontWeights: {
    bold: TextStyle["fontWeight"];
  };
}

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

export const obiTheme = {
  ...common,
  colors: {
    background: "#1a1a1a",
    panelBackground: "#272727",
  },
  background: {
    image: undefined,
    color: "#1a1a1a",
  },
  // TODO: modal: review web & native
  textStyles: {
    bold: {
      fontFamily: "Poppins",
      fontWeight: "bold",
    },
    regular: {
      fontFamily: "Poppins",
      fontWeight: "normal",
    },
    light: {
      fontFamily: "Poppins",
      fontWeight: "300",
    },
  } as const,
};

export const osmosisTheme = {
  ...obiTheme,
  colors: {
    background: "#131032",
    panelBackground: "#27284E",
  },
  background: {
    image: "/background.png",
    color: "#131032",
  },
} as const;

export type CustomTheme = typeof obiTheme;
