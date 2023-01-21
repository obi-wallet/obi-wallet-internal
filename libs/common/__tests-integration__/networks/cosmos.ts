import { cosmos } from "../../src";

test("fetchPrices", async () => {
  const prices = await cosmos.fetchPrices({ chainId: "juno-1" });
  expect(prices).toBeDefined();
});
