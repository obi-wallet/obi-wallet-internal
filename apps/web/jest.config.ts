import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  clearMocks: true,
  setupFilesAfterEnv: [require.resolve("./jest.setup.ts")],
  testPathIgnorePatterns: ["/__tests-e2e__/"],
  watchman: false,
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        importHelpers: true,
        allowJs: true,
        esModuleInterop: true,
      },
    }],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transformIgnorePatterns: [
    "/node_modules/(?!(sss-wasm|bitcoinjs-lib)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
  moduleDirectories: ["node_modules", "<rootDir>/node_modules", "src"],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
    url: "http://localhost",
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  testRunner: "jest-jasmine2",
  resolver: "<rootDir>/jest.resolver.js",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  testEnvironment: "jest-environment-node",
};

export default createJestConfig(config);
