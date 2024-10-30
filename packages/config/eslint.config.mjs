import packageConfig from "@repo/eslint-config/package.mjs";

export default [
  ...packageConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
