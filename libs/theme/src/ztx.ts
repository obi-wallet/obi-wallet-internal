import { TextStyle, ViewStyle } from "react-native";

import {
  AccountSettingComponent,
  ButtonStyleType,
  CustomTheme,
  ImagePosition,
  WelcomeButton,
} from "./abstract";
import { common } from "./common";

export const colors = {
  grey2: "#16161E",
  grey4: "#24242E",
  grey5: "#3E4859",
  grey6: "#929EB5",
  grey7: "#D5DDE5",
  grey8: "#F6F8FC",
  white: "#FFFFFF",
  black: "#000000",
  primaryGold: "#CAA767",
  hoverGold: "#B0915A",
  errorRed: "#E10E34",
};
const buttonsDefaultStyle = {
  container: {
    backgroundColor: "transparent",
    borderRadius: 5,
    borderWidth: 1,
    height: 36,
    marginVertical: 9,
  } as ViewStyle,
  text: {
    textTransform: "uppercase",
    color: colors.grey8,
  } as TextStyle,
};
export const ztxTheme: CustomTheme = {
  ...common,
  loginModal: true,
  colors: {
    primary: colors.primaryGold,
    background: "hsla(240, 15%, 10%, 1)",
    panelBackground: "#363D4D",
    label: colors.grey6,
    text: colors.grey8,
    cancel: colors.grey6,
  },
  background: {
    color: "#16151D",
  },
  modal: {
    borderRadius: "3px",
    width: 375,
    height: 750,
    accountSettings: [
      AccountSettingComponent.MaxSpend,
      AccountSettingComponent.VerifiedItems,
    ],
    paddingHorizontal: 22,
  },
  buttonsContainerStyle: {
    paddingHorizontal: 0,
    paddingBottom: 22,
    minHeight: 131,
    justifyContent: "space-between",
  },
  defaultDisabledButtonStyle: {
    borderColor: colors.grey5,
    opacity: 1,
    text: {
      color: colors.grey5,
    },
  },

  header: {
    paddingLeft: 22,
    image: {
      src: "/ztx-header@2x.png",
      flex: 1,
      maxWidth: 76,
      height: 18,
      marginTop: "auto",
      marginBottom: "auto",
    },
    height: 74,
    borderBottomColor: "#3E4859",
    borderBottomWidth: 1,
    closeIcon: {
      src: "./ztx-close-icon.svg",
      marginTop: 16,
      marginRight: 16,
    },
    paddingHorizontal: 0,
    marginVertical: 0,
    backIcon: {
      src: "./ztx-back-icon.svg",
      width: 8,
      height: 16,
      justifyContent: "center",
      alignItems: "center",
    },
  },
  buttonFlavors: {
    primary: {
      container: {
        ...buttonsDefaultStyle.container,
        borderColor: colors.primaryGold,
      },
      containerHovered: {
        borderColor: colors.hoverGold,
      },
      text: buttonsDefaultStyle.text,
    } as ButtonStyleType,
    cancel: {
      container: {
        ...buttonsDefaultStyle.container,
        borderColor: colors.grey6,
      },
      containerHovered: {
        borderColor: colors.grey5,
      },
      text: {
        ...buttonsDefaultStyle.text,
      },
    } as ButtonStyleType,
  },
  iconButtonFlavors: {
    primary: {
      backgroundColor: "transparent",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.primaryGold,
    },
    panel: {
      backgroundColor: "transparent",
      padding: 0,
      width: 24,
      height: 24,
      alignSelf: "center",
    },
  },
  textStyles: {
    bold: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "bold",
    },
    regular: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "normal",
    },
    light: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "300",
    },
  },
  dropdown: {
    labelStyle: {
      color: colors.grey7,
      textTransform: "none",
      fontSize: 12,
      fontFamily: "TT Hoves Pro",
    },
    containerStyle: {
      borderWidth: 0,
      borderRadius: 3,
      backgroundColor: colors.grey4,
      paddingHorizontal: 16,
    },
  },
  textInput: {
    labelStyle: {
      fontSize: 12,
      fontFamily: "TT Hoves Pro",
      fontStyle: "normal",
      fontWeight: "300",
      color: colors.grey7,
      textTransform: "none",
    },
    inputStyle: {
      fontSize: 14,
      fontFamily: "TT Hoves Pro",
      fontStyle: "normal",
      fontWeight: "400",
      color: colors.grey8,
      borderRadius: 3,
      padding: 12,
      height: 42,
      borderWidth: 0,
      backgroundColor: colors.grey4,
    },
    placeholderTextColor: colors.grey6,
  },
  i18n: {
    welcome: {
      title: "Welcome to ZTX",
      subTitle:
        "The ZTX smart account is the most convenient and secure way to manage your assets in the metaverse.",
    },
    accountName: "Obi Smart Account",
  },
  titleFalvors: {
    title: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "500",
      fontSize: 22,
      lineHeight: 22,
      color: colors.grey8,
    },
    subTitle: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "500",
      fontSize: 22,
      lineHeight: 22,
      color: colors.grey6,
    },
  },
  phoneKey: {
    title1: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "500",
      fontSize: 22,
      lineHeight: 22,
      color: colors.grey8,
    },
    title2: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "500",
      fontSize: 22,
      lineHeight: 22,
      color: colors.grey6,
    },
    info: {
      backgroundColor: colors.grey4,
      padding: 16,
      marginVertical: 36,
      text: {
        fontFamily: "TT Hoves Pro",
        fontWeight: "400",
        fontSize: 14,
        lineHeight: 18,
        color: colors.grey8,
      },
    },
    inlineButton: {
      padding: 0,
      borderWidth: 0,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      borderRadius: 0,
    },
  },
  welcome: {
    image: "ztx-welcome.png",
    imagePosition: ImagePosition.Center,
    hideHeaderLogo: false,
    horizontalSpacing: 20,
    buttons: [
      WelcomeButton.Zepeto,
      WelcomeButton.Login,
      WelcomeButton.GetStarted,
    ],
    subtitleStyles: {
      textAlign: "center",
      width: 263,
      marginHorizontal: "auto",
    },
    titleStyles: {
      textAlign: "center",
      fontFamily: "Sci Fi Bronze",
      fontSize: 22,
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: 22,
    },
  },
  settings: {
    textInputBackgroundColor: "#16151D",
    panelContainer: {
      borderRadius: 3,
      backgroundColor: "transparent",
      borderWidth: 1,
      paddingHorizontal: 14,
      borderColor: "#929EB5",
      height: 52,
      alignItems: "center",
    },
  },
  style: "ztx",
  balance: {
    marginTop: 28,
    title: {
      textTransform: "none",
      fontSize: 14,
      marginBottom: 12,
    },
    button: {
      borderWidth: 0,
    },
    buttonLabel: {
      fontSize: 12,
      marginTop: 8,
    },

    assets: {
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      paddingHorizontal: 0,
      marginHorizontal: 16,
      backgroundColor: "#24242E",
    },
    assetsHeader: {
      // height: 56,
      textTransform: "none",
      fontSize: 14,
      borderBottomColor: "#3E4859",
      paddingHorizontal: 22,
    },
    assetsList: {
      paddingHorizontal: 22,
    },
    assetIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "black",
      labelColor: "#F6F8FC",
      denomColor: "#929EB5",
    },
  },
  send: {
    title: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "normal",
      fontSize: 22,
      textAlign: "left",
    },
    address: {
      borderRadius: 3,
      borderWidth: 0,
      backgroundColor: "#24242E",
      // @ts-expect-error web-only prop
      outline: 0,
      paddingLeft: 12,
      height: 42,
    },
    asset: {
      borderRadius: 3,
      borderWidth: 1,
      backgroundColor: "transparent",
      outline: 0,
      borderColor: "#929EB5",
    },
    token: {
      container: {
        flexDirection: "column",
        borderColor: "transaprent",
        backgroundColor: "transparent",
        borderWidth: 0,
      },
      asset: {
        height: 42,
        borderRadius: 3,
        borderColor: "#929EB5",
        borderWidth: 1,
        backgroundColor: "transparent",
      },
      amount: {
        conatiner: {
          paddingHorizontal: 12,
          height: 42,
          borderRadius: 3,
          backgroundColor: "#24242E",
        },
        input: {
          borderRadius: 0,
          // @ts-expect-error web-only prop
          outline: 0,
          textAlign: "left",
          fontSize: 14,
        },
      },
    },
    next: {
      marginTop: 36,
      button: { marginVertical: 0, width: 180, height: 36, borderRadius: 3 },
      label: {
        textTransform: "uppercase",
      },
    },
  },
  receive: {
    title: {
      fontFamily: "TT Hoves Pro",
      fontWeight: "normal",
      fontSize: 22,
      textAlign: "left",
    },
    address: {
      container: {
        flex: undefined,
        marginTop: 36,
        paddingHorizontal: 42,
        justifyContent: "flex-start",
      },
      qrCode: {
        borderRadius: 0,
        padding: 0,
        width: "100%",
        marginBottom: 36,
      },
      textInput: {
        showLabel: false,
        borderRadius: 3,
        backgroundColor: "#24242E",
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      },
      text: {
        fontSize: 14,
        color: "#ffffff",
        marginTop: 0,
      },
    },
  },
  keyManagement: {
    threshold: {
      container: {
        marginTop: 36,
        backgroundColor: "transparent",
        justifyContent: "center",
        padding: 0,
      },
      threshold: {
        fontWeight: "500",
        color: colors.grey8,
      },
      activated: {
        fontWeight: "500",
        color: colors.primaryGold,
      },
    },
  },
};
