import { TargetChain } from "@/target-chain";
import { BitcoinChainId } from "@/target-chain/bitcoin/chains";
import { createTestSuite } from "@/tests";
import { expect, vi } from 'vitest';
import invariant from "tiny-invariant";

export const testSuite = createTestSuite(({ test }) => {
  test("native asset info (BTC)", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const assetId = targetChain.denomToCaip19AssetId("BTC");
    invariant(assetId, "Asset ID should not be null");

    const assetInfo = await targetChain.assetInfo(assetId);
    expect(assetInfo).toBeDefined();
    expect(assetInfo?.symbol).toBe("BTC");
    expect(assetInfo?.name).toBe("Bitcoin");
    expect(assetInfo?.decimals).toBe(8);
  });

  test("nativeBalancesQueryFn returns correct balance", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // Satoshi Nakamoto's address

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        final_balance: 10026285498, // Actual balance from blockchain.info
      }),
    });

    const balances = await targetChain.nativeBalancesQueryFn(address);
    expect(balances).toHaveLength(1);
    expect(balances[0]!.assetId).toBe(targetChain.denomToCaip19AssetId("BTC"));
    expect(balances[0]!.rawAmount).toBe("10026285498");

    // Cleanup mock
    global.fetch = originalFetch;
  });

  test("tokenBalanceQueryFn returns '0' for any asset", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const balance = await targetChain.tokenBalanceQueryFn({
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      assetId: "some:nonexistent/token" as any,
    });
    expect(balance).toBe("0");
  });

  test("isNativeAsset recognizes BTC as native", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const assetId = targetChain.denomToCaip19AssetId("BTC");
    invariant(assetId, "Asset ID should not be null");
    const isNative = targetChain.isNativeAsset(assetId);
    expect(isNative).toBe(true);
  });

  test("isTokenAsset always returns false", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const isToken = targetChain.isTokenAsset("any:asset/id" as any);
    expect(isToken).toBe(false);
  });
});