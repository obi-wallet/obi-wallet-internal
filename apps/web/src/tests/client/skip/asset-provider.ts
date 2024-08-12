import { SkipAssetProvider } from "@/skip";
import { createTestSuite, expect } from "@/tests";

export const testSuite = createTestSuite(({ test }) => {
  test("assetInfo SEI", async () => {
    const assetProvider = new SkipAssetProvider();
    const assetInfo = await assetProvider.assetInfo(
      "cosmos:pacific-1/native:usei",
    );
    expect(assetInfo?.symbol).to.equal("SEI");
  });
});
