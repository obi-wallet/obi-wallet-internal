import { CustomTheme } from "./abstract";
import { obiTheme } from "./obi";

export const osmosisTheme: CustomTheme = {
  ...obiTheme,
  colors: {
    primary: "#437DFF",
    background: "#131032",
    panelBackground: "#27284E",
  },
  background: {
    image: "/background.png",
    color: "#131032",
  },
  header: {
    image: "/osmosis-header.png",
    width: 208,
    height: 41,
  },
  buttonFlavors: {
    primary: {
      background: "linear-gradient(to right, #df05cb, #2c07e3)",
    },
    cancel: {
      borderWidth: 1,
      borderColor: "#ffffff",
    },
  },
  i18n: {
    welcome: {
      title: "Osmosis Smart Account",
      subTitle:
        "Welcome to the most secure and convenient way to manage your trading on Osmosis!",
    },
    accountName: "Osmosis Smart Account",
  },
  welcome: {
    image: "/osmosis-home.png",
  },
};
