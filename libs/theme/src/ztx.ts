import {
  AccountSettingComponent,
  CustomTheme,
  ImagePosition,
  WelcomeButton,
} from "./abstract";
import { common } from "./common";
import { observer } from "mobx-react-lite";
import Svg, { SvgProps, Path } from "react-native-svg";

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
    borderRadius: "25px",
    accountSettings: [
      AccountSettingComponent.MaxSpend,
      AccountSettingComponent.VerifiedItems,
    ],
  },
  header: {
    image: {
      url: "/ztx-header@2x.png",
      flex: 1,
      maxWidth: 76,
      height: 18,
      marginTop: "auto",
      marginBottom: "auto",
    },
    height: 74,
    borderBottomColor: "#3E4859",
    borderBottomWidth: 1,
    closeIcon: ZtxCloseIcon,
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
        "The ZTX smart account is the most convenient and secure way to manage your assets in the metaverse.",
    },
    accountName: "Obi Smart Account",
  },
  welcome: {
    // background: {
    //   // image: "/ztx-home@2x.png",
    //   color: "#16151D",
    //   blendMode: "luminosity",
    //   position: "center",
    // },
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
};
