import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import path from "node:path";
import { mergeConfig } from "vite";

const config = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@obi-wallet/common": path.join(__dirname, "../../common/src"),
          "@obi-wallet/headless-ui": path.join(
            __dirname,
            "../../headless-ui/src"
          ),
          "@obi-wallet/sdk": path.join(__dirname, "../../sdk/src"),
          crypto: "crypto-browserify",
          "react-native": "react-native-web",
          "react-shadow/emotion": "react-shadow/emotion.esm",
        },
      },
      optimizeDeps: {
        esbuildOptions: {
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
    });
  },
};

// eslint-disable-next-line import/no-default-export
export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
