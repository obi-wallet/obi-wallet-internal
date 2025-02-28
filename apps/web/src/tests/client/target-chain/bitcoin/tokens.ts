import { TargetChain } from "@/target-chain";
import { BitcoinChainId } from "@/target-chain/bitcoin/chains";
import { createTestSuite } from "@/tests";
import { expect, jest } from "@jest/globals";
import invariant from "tiny-invariant";

export const testSuite = createTestSuite(({ test }) => {
  test("native asset info (BTC)", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const assetId = targetChain.denomToCaip19AssetId("BTC");
    invariant(assetId, "Asset ID should not be null");

    const assetInfo = await targetChain.assetInfo(assetId);
    expect(assetInfo).not.toBeNull();
    expect(assetInfo?.symbol).toBe("BTC");
    expect(assetInfo?.name).toBe("Bitcoin");
    expect(assetInfo?.decimals).toBe(8);
  });

  test("nativeBalancesQueryFn returns correct balance", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // Satoshi Nakamoto's address

    const originalFetch = global.fetch;
    const mockResponse: Response = {
      ok: true,
      json: async () => {
        return { final_balance: 6800000000 }; // 68 BTC in satoshis
      },
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => {
        return new ArrayBuffer(0);
      },
      blob: async () => {
        return new Blob();
      },
      formData: async () => {
        return new FormData();
      },
      text: async () => {
        return "";
      },
      clone: () => {
        return Object.create(mockResponse);
      },
      type: "basic",
      url: "",
      redirected: false,
    };
    const mockFetch = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mockResponse);
    global.fetch = mockFetch;

    const balances = await targetChain.nativeBalancesQueryFn(address);
    expect(balances).toHaveLength(1);
    expect(balances[0]?.assetId).toBe(targetChain.denomToCaip19AssetId("BTC"));
    expect(balances[0]?.rawAmount).toBe("6800000000");

    // Cleanup mock
    mockFetch.mockClear();
    global.fetch = originalFetch;
  });

  test("tokenBalanceQueryFn returns '0' for any asset", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const nonexistentAssetId =
      "eip155:1/erc20:0x0000000000000000000000000000000000000000";
    const balance = await targetChain.tokenBalanceQueryFn({
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      assetId: nonexistentAssetId,
    });
    expect(balance).toBe("0");
  });

  test("isNativeAsset recognizes BTC as native", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const assetId = targetChain.denomToCaip19AssetId("BTC");
    invariant(assetId, "Asset ID should not be null");
    const isNative = targetChain.isNativeAsset(assetId);
    expect(isNative).toBeTruthy();
  });

  test("isTokenAsset always returns false", async () => {
    const targetChain = TargetChain.chainId(BitcoinChainId.Mainnet);
    const nonexistentAssetId =
      "eip155:1/erc20:0x0000000000000000000000000000000000000000";
    const isToken = targetChain.isTokenAsset(nonexistentAssetId);
    expect(isToken).toBeFalsy();
  });
});
