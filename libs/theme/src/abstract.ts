import { TextStyle, ViewStyle } from "react-native";

export enum AccountSettingComponent {
  MaxSpend = "MaxSpend",
  SlippageLimit = "SlippageLimit",
  WhitelistedLps = "WhitelistedLps",
  AutoStopLoss = "AutoStopLoss",
  WeeklyDca = "WeeklyDca",
  VerifiedItems = "VerifiedItems",
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
export interface BackgroundStyle {
  image?: string;
  color: string;
  blendMode?: string;
  size?: string;
  position?: string;
}
export interface CustomTheme extends CommonTheme {
  loginModal?: boolean;
  colors: {
    primary: string;
    background: string;
    panelBackground: string;
  };
  background: BackgroundStyle;
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
  welcome: {
    background?: BackgroundStyle;
    image?: string;
    imagePosition?: ImagePosition;
    buttons: WelcomeButton[];
    hideHeaderLogo?: boolean;
    horizontalSpacing?: number;
    buttonSpacing?: number;
  };
  settings?: {
    textInputBackgroundColor?: string;
  };
}
export enum WelcomeButton {
  Login = "login",
  GetStarted = "get-started",
  RecoverWallet = "recover-wallet",
  Demo = "demo",
  Zepeto = "zepeto",
}

export enum ImagePosition {
  Center = "center",
  Top = "top",
  Bottom = "bottom",
}
