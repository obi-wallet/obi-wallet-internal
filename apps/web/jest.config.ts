import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
};

// eslint-disable-next-line import/no-default-export
export default createJestConfig(config);
