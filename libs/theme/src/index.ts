export interface CommonTheme {
  spacing: {
    0: 0;
    4: 4;
    8: 8;
    12: 12;
    16: 16;
    24: 24;
    32: 32;
    64: 64;
    72: 72;
    128: 128;
  };
}

export interface CustomTheme extends CommonTheme {
  colors: {
    background: string;
  };
  fonts: {
    light: string;
    regular: string;
    bold: string;
  };
}

export const common: CommonTheme = {
  // 4dp grid
  spacing: {
    0: 0,
    4: 4,
    8: 8,
    12: 12,
    16: 16,
    24: 24,
    32: 32,
    64: 64,
    72: 72,
    128: 128,
  },
};

export const obiTheme: CustomTheme = {
  ...common,
  colors: {
    background: "#1a1a1a",
  },
  fonts: {
    bold: "poppins-bold",
    regular: "poppins-regular",
    light: "poppins-light",
  },
};

export const loopTheme: CustomTheme = {
  ...common,
  colors: {
    background: "#090817",
  },
  fonts: {
    bold: "Inter-Bold",
    regular: "Inter-Regular",
    light: "Inter-Light",
  },
};
