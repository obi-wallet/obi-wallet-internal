import { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      height: {
        revertLayer: "revert-layer",
      },
      colors: {
        primary: "#32c9af",
        background: "#070707",
        text: "#ffffff",
        accent: "#0e0e25",
        secondary: "#0e0e25",
        "banner-bg": "#ee9d38",
        "background-main": "#05070C",
        "background-primary": "#3C87CA",
        "background-primary-hover": "#0284c7",
        "background-primary-active": "#0EA5E9",
        "background-primary-disabled": "#3C87CA",
        "background-secondary": "#070A12",
        "background-select": "var(--background-select)",
        "background-select-hover": "var(--background-select-hover)",
        "background-select-active": "var(--background-select-active)",
        "background-select-disabled": "var(--background-select-disabled)",

        "--foreground-primary": "var(--foreground-primary)",
        "--foreground-primary-border": "var(--foreground-primary-border)",
      },
      fontFamily: {
        "roboto-mono": ['"Roboto Mono"', "monospace"],
        normal: ['"Roboto Mono"', "monospace"],
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
