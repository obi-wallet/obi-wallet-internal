import { CustomTheme } from "./abstract";
import { obiTheme } from "./obi";

export const vertexTheme: CustomTheme = {
  ...obiTheme,
  colors: {
    background: "#1A191E",
    panelBackground: "#51455F",
  },
  background: {
    color: "#1A191E",
  },
  header: {
    image: "/vertex-header.png",
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
};
