import { TargetChain } from "@/target-chain";
import { BitcoinChainId } from "@/target-chain/bitcoin/chains";
import { createTestSuite, expect } from "@/tests";
import invariant from "tiny-invariant";

export const testSuite = createTestSuite(({ test }) => {
  test("native asset info (BTC)", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const assetId = targetChain.denomToCaip19AssetId("BTC");
    invariant(assetId, "Asset ID should not be null");

    const assetInfo = await targetChain.assetInfo(assetId);
    expect(assetInfo).to.not.be.null;
    expect(assetInfo?.symbol).to.equal("BTC");
    expect(assetInfo?.name).to.equal("Bitcoin");
    expect(assetInfo?.decimals).to.equal(8);
  });

  test("nativeBalancesQueryFn returns correct balance", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // Satoshi Nakamoto's address

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        final_balance: 6800000000, // 68 BTC in satoshis
      }),
    });

    const balances = await targetChain.nativeBalancesQueryFn(address);
    expect(balances).to.have.lengthOf(1);
    expect(balances[0]!.assetId).to.equal(targetChain.denomToCaip19AssetId("BTC"));
    expect(balances[0]!.rawAmount).to.equal("6800000000");

    // Cleanup mock
    (global.fetch as jest.Mock).mockClear();
    global.fetch = originalFetch;
  });

  test("tokenBalanceQueryFn returns '0' for any asset", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const balance = await targetChain.tokenBalanceQueryFn({
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      assetId: "some:nonexistent/token" as any,
    });
    expect(balance).to.equal("0");
  });

  test("isNativeAsset recognizes BTC as native", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const assetId = targetChain.denomToCaip19AssetId("BTC");
    invariant(assetId, "Asset ID should not be null");
    const isNative = targetChain.isNativeAsset(assetId);
    expect(isNative).to.be.true;
  });

  test("isTokenAsset always returns false", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const isToken = targetChain.isTokenAsset("any:asset/id" as any);
    expect(isToken).to.be.false;
  });
});