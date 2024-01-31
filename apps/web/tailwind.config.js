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
      backgroundGradient: () => ({
        "gradient-background": `linear-gradient(to right bottom, rgba(0, 0, 0, 1), var(--background-main))`,
      }),
    },
  },
  plugins: [],
};
