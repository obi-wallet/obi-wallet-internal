import { terra } from "../../src";

test("fetchPrices", async () => {
  const prices = await terra.fetchPrices({ chainId: "phoenix-1" });
  expect(prices).toBeDefined();
});
