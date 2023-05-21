import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import inject from "@rollup/plugin-inject";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { mergeConfig } from "vite";

const extensions = [
  ".web.tsx",
  ".tsx",
  ".web.ts",
  ".ts",
  ".web.jsx",
  ".jsx",
  ".web.js",
  ".js",
  ".css",
  ".json",
];

const config = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal({ plugins, ...config }) {
    return mergeConfig(config, {
      define: {
        __DEV__: process.env.NODE_ENV !== "production",
        "process.env": {
          PHONE_NUMBER_KEY_SECRET: process.env.PHONE_NUMBER_KEY_SECRET,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_USER:
            process.env.PHONE_NUMBER_TWILIO_BASIC_AUTH_USER,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD:
            process.env.PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD,
        },
      },

      plugins: [
        ...plugins.filter((plugin) => {
          return plugin?.[0]?.name !== "vite:react-babel";
        }),
        react(),
      ],
      resolve: {
        alias: {
          "@obi-wallet/common": path.join(__dirname, "../../common/src"),
          "@obi-wallet/config": path.join(__dirname, "../../config/src"),
          "@obi-wallet/headless-ui": path.join(
            __dirname,
            "../../headless-ui/src"
          ),
          "@obi-wallet/sdk": path.join(__dirname, "../../sdk/src"),
          "@obi-wallet/theme": path.join(__dirname, "../../theme/src"),
          crypto: "crypto-browserify",
          stream: "stream-browserify",
          "react-native": "react-native-web",
          "react-shadow/emotion": "react-shadow/emotion.esm",
        },
        extensions,
      },
      optimizeDeps: {
        esbuildOptions: {
          mainFields: ["module", "main"],
          resolveExtensions: extensions,
          define: {
            global: "globalThis",
          },
          plugins: [
            NodeGlobalsPolyfillPlugin({
              buffer: true,
            }),
          ],
        },
      },
      build: {
        rollupOptions: {
          plugins: [inject({ Buffer: ["buffer", "Buffer"] })],
        },
      },
    });
  },
};

// eslint-disable-next-line import/no-default-export
export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
