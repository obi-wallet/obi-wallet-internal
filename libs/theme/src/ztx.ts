import {
  AccountSettingComponent,
  CustomTheme,
  ImagePosition,
  WelcomeButton,
} from "./abstract";
import { common } from "./common";

const colors = {
  gray8: "#F6F8FC",
  gray6: "#929EB5",
  white: "#FFFFFF",
  grey5: "#3E4859",
  grey2: "#16161E",
  grey4: "#24242E",
  black: "#000000",
  primaryGold: "#CAA767",
  hoverGold: "#B0915A",
  errorRed: "#E10E34",
};
export const ztxTheme: CustomTheme = {
  ...common,
  loginModal: true,
  colors: {
    primary: "#243FEA",
    background: "hsla(240, 15%, 10%, 1)",
    panelBackground: "#363D4D",
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
  header: {
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
      marginLeft: 22,
      marginTop: 29,
    },
  },
  buttonFlavors: {
    primary: {
      backgroundColor: "transparent",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.primaryGold,
    },
    cancel: {
      backgroundColor: "transparent",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#ffffff",
    },
  },
  iconButtonFlavors: {
    primary: {
      backgroundColor: "transparent",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.primaryGold,
    },
    panel: {
      backgroundColor: "#243fea",
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
  i18n: {
    welcome: {
      title: "Welcome to ZTX",
      subTitle:
        "The ZTX smart account is the most convenient and secure way to manage your assets in the metaverse.",
    },
    accountName: "Obi Smart Account",
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
  },
  balance: {
    marginTop: 28,
    title: {
      textTransform: "none",
      fontSize: 14,
      marginBottom: 12,
    },
    style: "ztx",
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
};
