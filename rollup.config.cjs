const { visualizer } = require("rollup-plugin-visualizer");

module.exports = (config) => {
  return {
    ...config,
    output: {
      ...config.output,
      preserveModules: true,
      preserveModulesRoot: config.input.split("/").slice(0, -1).join("/"),
    },
    plugins: [...config.plugins, visualizer()],
  };
};
