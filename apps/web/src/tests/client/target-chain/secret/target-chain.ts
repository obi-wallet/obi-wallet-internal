import { TargetChain } from "@/target-chain";
import { SecretChainId } from "@/target-chain/secret/chains";
import { createTestSuite, expect } from "@/tests";

export const testSuite = createTestSuite(({ test }) => {
  test("token info", async () => {
    const targetChain = TargetChain.chainId(SecretChainId.Secret);
    const tokenInfo = await targetChain.tokenInfo(
      "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
    );
    expect(tokenInfo.symbol).to.equal("SHD");
  });
});
