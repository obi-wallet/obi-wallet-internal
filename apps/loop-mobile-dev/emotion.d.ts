import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    fonts: {
      bold?: string;
      light?: string;
      medium?: string;
      regular?: string;
      semibold?: string;
    };
    colors: {
      background?: string;
      primary?: string;
      positive?: string;
      negative?: string;
    };
  }
}
