import packageConfig from "./package.mjs";

export default [
  ...packageConfig,
  {
    files: ["src/app/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
