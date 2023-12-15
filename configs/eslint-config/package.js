const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "plugin:mobx/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "eslint-config-turbo",
    "prettier",
  ],
  plugins: ["mobx", "import", "react", "react-hooks", "unicorn"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    "import/no-default-export": "error",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "{apps,libs}/*/{.storybook,__fixtures__,__stories__,__tests__,__tests-integration__,scripts}/**/*",
          "{apps,libs}/*/test-setup.ts",
          "apps/*-e2e/**/*",
          "apps/*/metro.config.js",
          "apps/*/next.config.js",
          "jest*.[jt]s",
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

    "mobx/missing-observer": "error",
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

    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks: "useAppStateEffect",
      },
    ],

    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
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
            message: "Please use TextInput from `@obi-wallet/common` instead.",
          },
        ],
      },
    ],
    "no-warning-comments": "warn",
  },
  settings: {
    react: {
      version: "detect",
      componentWrapperFunctions: ["observer"],
    },
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
  ],
  overrides: [
    {
      files: ["*.js?(x)", "*.ts?(x)"],
    },
    {
      files: ["*.ts", "*.tsx"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
      plugins: ["@typescript-eslint"],
    },
  ],
};
