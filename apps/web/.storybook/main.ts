import type { StorybookConfig } from "@storybook/nextjs";

import { join, dirname } from "path";
import webpack from "webpack";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../public", "./public"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {
      builder: {},
    },
  },
  docs: {
    autodocs: "tag",
  },
  swc: (config, options) => {
    return {
      ...config,
      decorators: true,
      decoratorVersion: "2022-03",
    };
  },
  async webpackFinal(config) {
    config.plugins = [
      ...(config.plugins ?? []),
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      }),
    ];
    return config;
  },
};

export default config;
