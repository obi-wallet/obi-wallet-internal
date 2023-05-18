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

export interface CustomTheme extends CommonTheme {
  colors: {
    background: string;
  };
  fonts: {
    light: string;
    regular: string;
    bold: string;
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

export const obiTheme: CustomTheme = {
  ...common,
  colors: {
    background: "#1a1a1a",
  },
  fonts: {
    // TODO: modal: review web & native
    bold: "Poppins",
    regular: "Poppins",
    light: "Poppins",
  },
};

export const loopTheme: CustomTheme = {
  ...common,
  colors: {
    background: "#090817",
  },
  fonts: {
    bold: "Inter-Bold",
    regular: "Inter-Regular",
    light: "Inter-Light",
  },
};
