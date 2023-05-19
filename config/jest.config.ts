module.exports = {
  preset: "react-native",
  resolver: "@nx/jest/plugins/resolver",
  moduleFileExtensions: ["ts", "js", "html", "tsx", "jsx"],
  setupFilesAfterEnv: [require.resolve("./jest.setup.ts")],
  moduleNameMapper: {
    ".svg": "@nx/react-native/plugins/jest/svg-mock",
  },
  transform: {
    "\\.(js|ts|tsx)$": require.resolve("./jest.preprocessor.js"),
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@fortawesome|@react-native|@react-navigation|react-native|react-native-code-push|react-native-device-info|react-native-dropdown-picker|react-native-haptic-feedback|react-native-keychain|react-native-iphone-x-helper|react-native-fontawesome|react-native-keyboard-aware-scroll-view|react-native-safe-area-context)/)",
  ],
  testPathIgnorePatterns: ["/__helpers__/"],
};
