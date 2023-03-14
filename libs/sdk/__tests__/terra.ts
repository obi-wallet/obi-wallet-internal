import { Sdk } from "../src";

describe("fetchPrices", () => {
  test("Cosmos", async () => {
    const result = await Sdk.chainId("juno-1").fetchPrices();
    expect(typeof result["ujuno"]).toEqual("number");
  });

  test("Terra", async () => {
    const result = await Sdk.chainId("phoenix-1").fetchPrices();
    expect(typeof result["uluna"]).toEqual("number");
  });
});
