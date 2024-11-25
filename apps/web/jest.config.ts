import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  coverageProvider: "v8",
  clearMocks: true,
  setupFilesAfterEnv: [require.resolve("./jest.setup.ts")],
  testPathIgnorePatterns: ["/__tests-e2e__/"],
  watchman: false,
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          importHelpers: true,
          allowJs: true,
        },
      },
    ],
    '^.+/node_modules/sss-wasm/.+\\.(js|jsx|mjs)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          allowJs: true,
        },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(sss-wasm)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
};

// eslint-disable-next-line import/no-default-export
export default createJestConfig(config);
