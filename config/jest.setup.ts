import "@testing-library/jest-native/extend-expect";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

// noinspection JSConstantReassignment
global.crypto = require("crypto");

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
jest.mock("@fortawesome/react-native-fontawesome", () => ({
  FontAwesomeIcon: "",
}));

jest.mock("react-native-code-push", () => ({
  NativeCodePush: {},
}));

jest.mock("@react-native-clipboard/clipboard", () => {
  return {};
});

jest.mock("react-native-nfc-manager", () => {
  return {};
});

jest.mock("react-native-country-picker-modal", () => {
  return {};
});

jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native"); // use original implementation, which comes with mocks out of the box

  // mock modules/components created by assigning to NativeModules
  RN.NativeModules.SettingsManager = {
    settings: {
      AppleLanguages: ["en-US"],
    },
  };
  RN.NativeModules.RNDeviceInfo = {};

  return RN;
});

// To avoid ESM issues
jest.mock("nanoid/non-secure", () => {
  let i = 0;
  return {
    nanoid() {
      return i++;
    },
  };
});

// To avoid ESM issues
jest.mock("isomorphic-unfetch", () => {
  return jest.requireActual("node-fetch");
});
