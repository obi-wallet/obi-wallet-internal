import { CustomTheme } from "./abstract";
import { obiTheme } from "./obi";

export const osmosisTheme: CustomTheme = {
  ...obiTheme,
  colors: {
    background: "#131032",
    panelBackground: "#27284E",
  },
  background: {
    image: "/background.png",
    color: "#131032",
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
};
