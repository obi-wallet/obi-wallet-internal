import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import "@testing-library/jest-native/extend-expect";

// noinspection JSConstantReassignment
global.crypto = require("crypto");

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
