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
    files: ["**/vitest.config.{ts,mts}", "**/vitest.setup.mts"],
    rules: {
      "import/no-extraneous-dependencies": "off",
      "import/no-default-export": "off",
    },
  },
  {
    files: ["**/tests/**/*.ts"],
    rules: {
      "import/no-extraneous-dependencies": "off",
      "import/no-unresolved": "off",
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
