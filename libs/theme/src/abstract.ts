import { TextStyle } from "react-native";

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
    panelBackground: string;
  };
  background: {
    image?: string;
    color: string;
  };
  textStyles: {
    bold: Pick<TextStyle, "fontFamily" | "fontWeight">;
    regular: Pick<TextStyle, "fontFamily" | "fontWeight">;
    light: Pick<TextStyle, "fontFamily" | "fontWeight">;
  };
}
