/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "background-main": "var(--background-main)",
        "background-primary": "var(--background-primary)",
        "background-primary-hover": "var(--background-primary-hover)",
        "background-primary-active": "var(--background-primary-active)",
        "background-primary-disabled": "var(--background-primary-disabled)",
        "background-secondary": "var(--background-secondary)",
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
      fontFamily: {
        "press-start-2p": ["var(--font-press-start-2p)"],
      },
    },
  },
  plugins: [],
};
