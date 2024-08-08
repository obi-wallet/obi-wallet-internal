import { TargetChain } from "@/target-chain";
import { CosmosChainId } from "@/target-chain/cosmos/chains";
import { createTestSuite, expect } from "@/tests";

export const testSuite = createTestSuite(({ test }) => {
  test("balance of factory token", async () => {
    const targetChain = TargetChain.chainId(CosmosChainId.Sei);
    const balances = await targetChain.nativeBalancesQueryFn(
      "sei1qegt2xqndqlf53csypt4pm2dm497elr63lc9j7",
    );
    console.log(balances);
  });

  test("native token (CAIP-19)", async () => {
    const targetChain = TargetChain.chainId(CosmosChainId.Sei);
    const assetId = "cosmos:pacific-1/slip44:118";
    const tokenInfo = await targetChain.newAssetInfo(assetId);
    expect(tokenInfo?.symbol).to.equal("SEI");
  });

  test("factory token (CAIP-19, chain registry)", async () => {
    const targetChain = TargetChain.chainId(CosmosChainId.Sei);
    const assetId =
      "cosmos:pacific-1/factory:sei1thgp6wamxwqt7rthfkeehktmq0ujh5kspluw6w%2FOIN";
    const tokenInfo = await targetChain.newAssetInfo(assetId);
    expect(tokenInfo?.symbol).to.equal("OIN");
  });

  test("factory token (CAIP-19, unknown)", async () => {
    const targetChain = TargetChain.chainId(CosmosChainId.Sei);
    const assetId =
      "cosmos:pacific-1/factory:sei1lwp83awd5d2gt4sfet47khj8cwav2lmqn904fe%2FOIN";
    const tokenInfo = await targetChain.newAssetInfo(assetId);
    expect(tokenInfo?.symbol).to.equal(
      "factory/sei1lwp83awd5d2gt4sfet47khj8cwav2lmqn904fe/OIN",
    );
  });

  test("CW20 Token (CAIP-19, chain registry)", async () => {
    const targetChain = TargetChain.chainId(CosmosChainId.Sei);
    const assetId =
      "cosmos:pacific-1/cw20:sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed";
    const tokenInfo = await targetChain.newAssetInfo(assetId);
    expect(tokenInfo?.symbol).to.equal("SEIYAN");
  });

  test("CW20 Token (CAIP-19, unknown)", async () => {
    const targetChain = TargetChain.chainId(CosmosChainId.Sei);
    const tokenInfo = await targetChain.tokenInfo(
      "sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed",
    );
    expect(tokenInfo?.symbol).to.equal("SEIYAN");
  });

  test("CW20 token balance fetching", async () => {
    const targetChain = TargetChain.chainId(CosmosChainId.Sei);
    const address = "sei1000qtmc2p4fcup8y57aue4a9s6ya8aszt8j9qd";
    const assetId =
      "cosmos:pacific-1/cw20:sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed";
    const balance = await targetChain.tokenBalance({
      address,
      assetId,
    });
    expect(balance).to.equal("100000000");
  });

  test("TODO: balance fetching for all of above test cases", async () => {});
});
