import "@emotion/react";

import { CustomTheme } from "./src";

declare module "@emotion/react" {
  // Has to be an interface
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends CustomTheme {}
}
