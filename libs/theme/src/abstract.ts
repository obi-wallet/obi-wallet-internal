import { TextStyle, ViewStyle } from "react-native";

export enum AccountSettingComponent {
  MaxSpend = "MaxSpend",
  SlippageLimit = "SlippageLimit",
  WhitelistedLps = "WhitelistedLps",
  AutoStopLoss = "AutoStopLoss",
  WeeklyDca = "WeeklyDca",
}

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
    primary: string;
    background: string;
    panelBackground: string;
  };
  background: {
    image?: string;
    color: string;
    backgroundBlendMode?: string;
  };
  modal: {
    borderRadius?: string;
    accountSettings: AccountSettingComponent[];
  };
  header?: {
    image: string;
    width: number;
    height: number;
  };
  buttonFlavors: {
    primary: ViewStyle & { background?: string };
    cancel: ViewStyle & { background?: string };
  };
  iconButtonFlavors: {
    primary: ViewStyle & { background?: string };
    panel: ViewStyle & { background?: string };
  };
  textStyles: {
    bold: Pick<TextStyle, "fontFamily" | "fontWeight">;
    regular: Pick<TextStyle, "fontFamily" | "fontWeight">;
    light: Pick<TextStyle, "fontFamily" | "fontWeight">;
  };
  i18n: {
    welcome: {
      title: string;
      subTitle: string;
    };
    accountName: string;
  };
  welcome?: {
    backgroundImage?: string;
    image?: string;
  };
  ethDemo?: boolean;
}
