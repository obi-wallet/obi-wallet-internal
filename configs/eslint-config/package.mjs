import mobx from "eslint-plugin-mobx";
import react from "eslint-plugin-react";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import hooks from "eslint-plugin-react-hooks";
import etc from "eslint-plugin-etc";

export default tseslint.config(
  { ignores: ["eslint.config.mjs"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  mobx.flatConfigs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    plugins: {
      etc,
    },
  },
  {
    plugins: {
      "react-hooks": hooks,
    },
    rules: hooks.configs.recommended.rules,
  },
  prettier,
  {
    plugins: {
      unicorn,
    },
    rules: {
      "@typescript-eslint/consistent-indexed-object-style": "error",
      "@typescript-eslint/consistent-generic-constructors": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "never",
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksConditionals: true,
          checksVoidReturn: false,
          checksSpreads: true,
        },
      ],
      "@typescript-eslint/no-unnecessary-template-expression": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNever: true,
          allowNumber: true,
        },
      ],
      "@typescript-eslint/return-await": ["error", "always"],

      "etc/prefer-interface": "error",

      "import/no-default-export": "error",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "{.storybook,__fixtures__,__stories__,__tests__,__tests-e2e__,__tests-integration__,scripts}/**/*",
            "**/storybook-helpers/**/*",
            "next.config.ts",
            "tailwind.config.ts",
            "vitest.config.mts",
            "vitest.setup.mts",
            "**/*.stories.*",
            "**/*.spec*",
            "**/*.test.*",
          ],
          optionalDependencies: false,
        },
      ],
      "import/no-useless-path-segments": [
        "error",
        {
          noUselessIndex: true,
        },
      ],
      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },
          groups: [
            ["builtin", "external", "internal"],
            ["parent", "sibling", "index", "unknown"],
          ],
          "newlines-between": "always",
        },
      ],

      "mobx/missing-observer": "off",
      "mobx/missing-make-observable": "off",
      "mobx/no-anonymous-observer": "error",

      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-curly-brace-presence": ["error", "never"],
      "react/jsx-pascal-case": "error",
      "react/no-unescaped-entities": "off",

      "react-hooks/exhaustive-deps": "error",

      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],

      "arrow-body-style": ["error", "always"],
      curly: ["error", "multi-line"],
      "no-restricted-globals": [
        "error",
        {
          name: "JSON",
          message: "Use @obi-wallet/sdk-json instead.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@tanstack/react-query",
              importNames: ["useQuery"],
              message:
                "Please use useQuery from `@obi-wallet/headless-ui` instead.",
            },
            {
              name: "react-native",
              importNames: ["KeyboardAvoidingView"],
              message:
                "Please use KeyboardAvoidingView from `src/app/screens/components/keyboard-avoding-view` instead.",
            },
            {
              name: "react-native",
              importNames: ["Modal"],
              message: "Please use Modal from `src/components/modal` instead.",
            },
            {
              name: "react-native",
              importNames: ["SafeAreaView"],
              message:
                "Please use SafeAreaView from `react-native-safe-area-context` instead.",
            },
            {
              name: "react-native",
              importNames: ["Text"],
              message: "Please use Text from `@obi-wallet/common` instead.",
            },
            {
              name: "react-native",
              importNames: ["TextInput"],
              message:
                "Please use TextInput from `@obi-wallet/common` instead.",
            },
          ],
        },
      ],
      "no-warning-comments": "warn",
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
      react: {
        version: "detect",
        componentWrapperFunctions: ["observer"],
      },
    },
  },
  {
    files: ["*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["vitest.config.mts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
);
