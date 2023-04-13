module.exports = {
  preset: "react-native",
  resolver: "@nrwl/jest/plugins/resolver",
  moduleFileExtensions: ["ts", "js", "html", "tsx", "jsx"],
  setupFilesAfterEnv: [require.resolve("./jest.setup.ts")],
  moduleNameMapper: {
    ".svg": "@nrwl/react-native/plugins/jest/svg-mock",
  },
  transform: {
    "\\.(js|ts|tsx)$": require.resolve("./jest.preprocessor.js"),
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@fortawesome|@react-native|@react-navigation|react-native|react-native-code-push|react-native-fontawesome|react-native-safe-area-context)/)",
  ],
  testPathIgnorePatterns: ["/__helpers__/"],
};
