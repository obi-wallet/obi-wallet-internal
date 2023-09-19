import { ImageStyle, TextStyle, ViewStyle } from "react-native";

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
export type ButtonStyleType = ViewStyle & { text?: TextStyle };
export interface CustomTheme extends CommonTheme {
  loginModal?: boolean;
  colors: {
    primary: string;
    background: string;
    panelBackground: string;
    label?: string;
  };
  buttonsContainerStyle?: ViewStyle;
  defaultDisabledButtonStyle?: ViewStyle & {
    text: TextStyle;
  };
  background: BackgroundStyle;
  modal: {
    borderRadius?: string;
    accountSettings: AccountSettingComponent[];
    width?: number;
    height?: number;
    paddingHorizontal?: number;
  };
  header?: ViewStyle & {
    image: ImageStyle & { src: string };
    closeIcon?: ImageStyle & { src: string };
    backIcon?: ImageStyle & { src: string };
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
  textInput?: {
    inputContainerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;
    containerStyle?: ViewStyle;
    placeholderTextColor?: string;
  };
  dropdown?: {
    containerStyle?: ViewStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;
    inputContainerStyle?: ViewStyle;
    inputStyle?: TextStyle;
  };
  i18n: {
    welcome: {
      title: string;
      subTitle: string;
    };
    accountName: string;
  };
  titleFalvors?: {
    title: TextStyle;
    subTitle: TextStyle;
  };
  phoneKey?: {
    title1: TextStyle;
    title2: TextStyle;
    info: ViewStyle & {
      text: TextStyle;
    };
    inlineButton: ViewStyle;
  };
  welcome: {
    background?: BackgroundStyle;
    image?: string;
    imagePosition?: ImagePosition;
    buttons: WelcomeButton[];
    hideHeaderLogo?: boolean;
    horizontalSpacing?: number;
    buttonSpacing?: number;
    subtitleStyles?: TextStyle;
    titleStyles?: TextStyle;
  };
  settings?: {
    textInputBackgroundColor?: string;
    panelContainer?: ViewStyle;
  };
  style?: string;
  balance?: {
    title?: ViewStyle & TextStyle;
    marginTop?: number;
    button?: ViewStyle;
    assets?: ViewStyle;
    buttonLabel?: ViewStyle & TextStyle;
    assetsHeader: ViewStyle & TextStyle;
    assetsList: ViewStyle & TextStyle;
    assetIcon: ViewStyle &
      TextStyle & {
        labelColor?: string;
        denomColor?: string;
      };
  };
  send?: {
    title: ViewStyle & TextStyle;
    address: ViewStyle & TextStyle;
    token: {
      container: ViewStyle & TextStyle;
      asset: ViewStyle & TextStyle;
      amount: {
        conatiner: ViewStyle & TextStyle;
        input: ViewStyle & TextStyle;
      };
    };
    next: {
      marginTop: number;
      button: ViewStyle & TextStyle;
      label: TextStyle;
    };
  };
  receive?: {
    title?: ViewStyle & TextStyle;
    address?: {
      container?: ViewStyle;
      qrCode?: ViewStyle;
      textInput?: ViewStyle & { showLabel: boolean };
      text?: TextStyle;
    };
  };
  keyManagement?: {
    threshold?: {
      container?: ViewStyle;
      threshold?: TextStyle;
      activated?: TextStyle;
    };
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
