import {
  WelcomeButton,
  AccountSettingComponent,
  CustomTheme,
} from "./abstract";
import { obiTheme } from "./obi";

export const vertexTheme: CustomTheme = {
  ...obiTheme,

  colors: {
    primary: "#CDADEF",
    background: "#1A191E",
    panelBackground: "#51455F",
  },
  background: {
    color: "#1A191E",
  },
  modal: {
    borderRadius: "4px",
    accountSettings: [
      AccountSettingComponent.MaxSpend,
      AccountSettingComponent.AutoStopLoss,
      AccountSettingComponent.WeeklyDca,
    ],
  },
  header: {
    image: "/vertex-header@2x.png",
    width: 177,
    height: 48,
  },
  buttonFlavors: {
    primary: {
      background: "linear-gradient(to right, #A47CD0, #523E68)",
    },
    cancel: {
      borderWidth: 1,
      borderColor: "#ffffff",
    },
  },
  iconButtonFlavors: {
    primary: {
      background: "linear-gradient(to right, #A47CD0, #523E68)",
    },
    panel: {
      backgroundColor: "#CDADEF",
    },
  },
  i18n: {
    welcome: {
      title: "Vertex Smart Account",
      subTitle:
        "Welcome to the most secure and convenient way to manage your trading on Vertex!",
    },
    accountName: "Vertex Smart Account",
  },
  welcome: {
    image: "/vertex-home@2x.png",
    hideHeaderLogo: false,
    buttons: [
      WelcomeButton.Login,
      WelcomeButton.Getstarted,
      WelcomeButton.Recoverwallet,
      WelcomeButton.Demo,
    ],
  },
  settings: {
    textInputBackgroundColor: "#16151D",
  },
  ethDemo: true,
};
