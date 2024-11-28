import { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      height: {
        revertLayer: "revert-layer",
        standardField: "46px",
      },
      colors: {
        primary: "#32c9af",
        background: "#070707",
        text: "#ffffff",
        accent: "#0e0e25",
        secondary: "#363636",
        "banner-bg": "#ee9d38",
        "background-main": "#070707",
        "background-primary": "#32c9af",
        "background-primary-hover": "#32f9df",
        "background-primary-active": "#32f9df",
        "background-primary-disabled": "#287564",
        "background-secondary": "#070707",
        "background-select": "var(--background-select)",
        "background-select-hover": "var(--background-select-hover)",
        "background-select-active": "var(--background-select-active)",
        "background-select-disabled": "var(--background-select-disabled)",
        "--foreground-primary": "var(--foreground-primary)",
        "--foreground-primary-border": "var(--foreground-primary-border)",
      },
      flex: {
        2: "2 2 0%",
        3: "3 3 0%",
        4: "4 4 0%",
        5: "5 5 0%",
        6: "6 6 0%",
        7: "7 7 0%",
        8: "8 8 0%",
        9: "9 9 0%",
        10: "10 10 0%",
      },
      backgroundImage: {
        "asset-hover-gradient":
          "linear-gradient(90deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)",
        "panel-gradient":
          "linear-gradient(134deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)",
      },
    },
  },
  plugins: [],
};

// eslint-disable-next-line import/no-default-export
export default config;
