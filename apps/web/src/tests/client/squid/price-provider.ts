import { SquidPriceProvider } from "@/squid";
import { createTestSuite, expect } from "@/tests";

export const testSuite = createTestSuite(({ test }) => {
  test("priceInfo SEI", async () => {
    const assetProvider = new SquidPriceProvider();
    const priceInfo = await assetProvider.priceInfo(
      "cosmos:pacific-1/native:usei",
    );
    expect(priceInfo).to.not.equal(null);
  });
});
