import { TargetChain } from "@/target-chain";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import invariant from "tiny-invariant";
import { expect, test } from "vitest";

test("ERC20 token", async () => {
  const targetChain = TargetChain.chainId(Eip155ChainId.Arbitrum);
  const assetId = targetChain.denomToCaip19AssetId(
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  );
  invariant(assetId, "assetId is not null");
  const tokenInfo = await targetChain.assetInfo(assetId);
  expect(tokenInfo?.decimals).toEqual(6);
  expect(tokenInfo?.symbol).toEqual("USDT");
});
