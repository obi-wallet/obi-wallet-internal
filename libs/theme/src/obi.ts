import { CustomTheme } from "./abstract";
import { common } from "./common";

export const obiTheme: CustomTheme = {
  ...common,
  colors: {
    primary: "#437DFF",
    background: "#1a1a1a",
    panelBackground: "#272727",
  },
  background: {
    color: "#1a1a1a",
  },
  buttonFlavors: {
    primary: {
      backgroundColor: "#437DFF",
    },
    cancel: {
      borderWidth: 1,
      borderColor: "#ffffff",
    },
  },
  // TODO: modal: review web & native
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
      title: "Welcome to Obi",
      subTitle:
        "Obi is the most secure and convenient way to manage assets in the Cosmos.",
    },
    accountName: "Obi Smart Account",
  },
  welcome: {
    image: "/obi-home.png",
  },
};
