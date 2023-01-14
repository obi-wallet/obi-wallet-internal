/* eslint-disable */
const defaultConfig = require("./jest.config");

module.exports = {
  ...defaultConfig,
  testRegex: "/__tests-integration__/.*\\.[jt]sx?$",
};
