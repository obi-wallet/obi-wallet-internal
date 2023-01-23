module.exports = {
  assets: ["../../libs/mobile/src/assets/fonts"],
  dependencies: {
    "react-native-device-crypto": {
      platforms: {
        android: null,
      },
    },
    "react-native-iap": {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
  project: {
    ios: {},
    android: {},
  },
};
