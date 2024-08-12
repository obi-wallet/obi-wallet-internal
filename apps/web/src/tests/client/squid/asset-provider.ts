import { SquidAssetProvider } from "@/squid";
import { createTestSuite, expect } from "@/tests";

export const testSuite = createTestSuite(({ test }) => {
  test("assetInfo SEI", async () => {
    const assetProvider = new SquidAssetProvider();
    const assetInfo = await assetProvider.assetInfo(
      "cosmos:pacific-1/native:usei",
    );
    expect(assetInfo?.symbol).to.equal("SEI");
  });
});
