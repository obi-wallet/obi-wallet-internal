import nextConfig from "@repo/eslint-config/next.mjs";
import storybook from "eslint-plugin-storybook";

export default [
  {
    ignores: [".storybook/public", ".next"],
  },
  ...nextConfig,
  ...storybook.configs["flat/recommended"],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [
      "**/middleware.ts",
      "**/*.stories.{ts,tsx,js,jsx}",
      ".storybook/main.ts",
      ".storybook/preview.tsx",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
