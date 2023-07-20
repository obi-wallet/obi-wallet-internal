import {
  AccountSettingComponent,
  CustomTheme,
  WelcomeButton,
} from "./abstract";
import { common } from "./common";

export const ztxTheme: CustomTheme = {
  ...common,
  ethereumBalances: true,
  loginModal: true,
  colors: {
    primary: "#243FEA",
    background: "#000000",
    panelBackground: "#363D4D",
  },
  background: {
    color: "#16151D",
  },
  modal: {
    borderRadius: "25px",
    accountSettings: [
      AccountSettingComponent.MaxSpend,
      AccountSettingComponent.VerifiedItems,
    ],
  },
  header: {
    image: "/ztx-header@2x.png",
    width: 177,
    height: 48,
  },
  buttonFlavors: {
    primary: {
      backgroundColor: "#243FEA",
      borderRadius: 5,
    },

    cancel: {
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#ffffff",
    },
  },
  iconButtonFlavors: {
    primary: {
      backgroundColor: "#243fea",
    },
    panel: {
      backgroundColor: "#243fea",
    },
  },
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
  },
  i18n: {
    welcome: {
      title: "Welcome to ZTX",
      subTitle:
        "The ZTX Smart account is the most convenient and secure way to manage your assets in the metaverse!",
    },
    accountName: "Obi Smart Account",
  },
  welcome: {
    background: {
      image: "/ztx-home@2x.png",
      color: "#16151D",
      blendMode: "luminosity",
      position: "center",
    },
    hideHeaderLogo: false,
    horizontalSpacing: 20,
    buttons: [WelcomeButton.Zepeto, WelcomeButton.Login],
  },
  settings: {
    textInputBackgroundColor: "#16151D",
  },
};
