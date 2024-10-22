// To avoid ESM issues
jest.mock("nanoid/non-secure", () => {
  let i = 0;
  return {
    nanoid() {
      return i++;
    },
  };
});

// To avoid WASM issues
jest.mock("sss-wasm", () => {
  return {};
});

// To avoid ESM issues
jest.mock("lodash-es", () => {
  return {};
});
