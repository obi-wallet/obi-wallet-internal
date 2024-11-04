import packageConfig from "@repo/eslint-config/package.mjs";

export default [
  {
    // TODO:
    ignores: ["src/mpc_bindings.js"],
  },
  ...packageConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/mpc_bindings.d.ts", "src/mpc_bindings_bg.wasm.d.ts"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },
];
