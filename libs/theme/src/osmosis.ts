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
};
