import scrollbar from "tailwind-scrollbar";
import { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      height: {
        revertLayer: "revert-layer",
        standardField: "46px",
        standardButton: "36px",
        tallButton: "48px",
      },
      colors: {
        primary: "var(--background-primary)",
        background: "var(--background-main)",
        text: "#ffffff",
        accent: "#0e0e25",
        secondary: "#363636",
        warning: "var(--background-warning)",
        "banner-bg": "#ee9d38",
        "background-main": "var(--background-main)",
        "background-primary": "var(--background-primary)",
        "background-primary-hover": "var(--background-primary-hover)",
        "background-primary-active": "var(--background-primary-active)",
        "background-primary-disabled": "var(--background-primary-disabled)",
        "background-select": "var(--background-select)",
        "background-select-hover": "var(--background-select-hover)",
        "background-select-active": "var(--background-select-active)",
        "background-select-disabled": "var(--background-select-disabled)",
        "foreground-primary": "var(--foreground-primary)",
        "foreground-primary-border": "var(--foreground-primary-border)",
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
  plugins: [scrollbar({ nocompatible: true })],
};

// eslint-disable-next-line import/no-default-export
export default config;
