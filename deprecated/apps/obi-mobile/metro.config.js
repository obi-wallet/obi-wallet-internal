const { withNxMetro } = require("@nx/react-native");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
    blockList: exclusionList([/^(?!.*node_modules).*\/dist\/.*/]),
    extraNodeModules: {
      buffer: require.resolve("buffer/"),
      crypto: require.resolve("react-native-crypto"),
      events: require.resolve("eventemitter3"),
      fs: require.resolve("react-native-level-fs"),
      os: require.resolve("os-browserify"),
      path: require.resolve("path-browserify"),
      process: require.resolve("process"),
      stream: require.resolve("stream-browserify"),
    },
    unstable_enableSymlinks: true,
    // TODO: this doesn't work yet
    // unstable_enablePackageExports: true,
  },
};

module.exports = withNxMetro(mergeConfig(defaultConfig, customConfig), {
  // Change this to true to see debugging info.
  // Useful if you have issues resolving modules
  debug: false,
  // all the file extensions used for imports other than 'ts', 'tsx', 'js', 'jsx', 'json'
  extensions: [],
  // Specify folders to watch, in addition to Nx defaults (workspace libraries and node_modules)
  watchFolders: [],
});
